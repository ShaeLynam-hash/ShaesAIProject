import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agency/clients?workspace=<slug>  — list client workspaces
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const agency = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true, isAgency: true,
      agencyClients: {
        include: {
          clientWorkspace: {
            select: {
              id: true, name: true, slug: true, logoUrl: true,
              plan: true, subscriptionStatus: true, createdAt: true,
              members: { select: { id: true } },
              contacts: { select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agency) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!agency.isAgency) return NextResponse.json({ error: "Not an agency workspace" }, { status: 403 });

  const clients = agency.agencyClients.map((ac) => ({
    id: ac.clientWorkspace.id,
    name: ac.clientWorkspace.name,
    slug: ac.clientWorkspace.slug,
    logoUrl: ac.clientWorkspace.logoUrl,
    plan: ac.clientWorkspace.plan,
    status: ac.clientWorkspace.subscriptionStatus,
    memberCount: ac.clientWorkspace.members.length,
    contactCount: ac.clientWorkspace.contacts.length,
    createdAt: ac.clientWorkspace.createdAt,
  }));

  return NextResponse.json({ clients });
}

// POST /api/agency/clients — create a new client workspace under this agency
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agencySlug, clientName, clientEmail } = await req.json();
  if (!agencySlug || !clientName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const agency = await prisma.workspace.findUnique({ where: { slug: agencySlug } });
  if (!agency || !agency.isAgency) return NextResponse.json({ error: "Not an agency" }, { status: 403 });

  // Generate slug from client name
  const baseSlug = clientName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const clientWorkspace = await prisma.workspace.create({
    data: {
      name: clientName,
      slug,
      plan: "STARTER",
      wlBrandName: agency.wlBrandName,
      wlLogoUrl: agency.wlLogoUrl,
      wlPrimaryColor: agency.wlPrimaryColor,
      wlSupportEmail: agency.wlSupportEmail ?? clientEmail ?? null,
      wlHideAttribution: agency.wlHideAttribution,
    },
  });

  // Link agency → client
  await prisma.agencyClient.create({
    data: { agencyWorkspaceId: agency.id, clientWorkspaceId: clientWorkspace.id },
  });

  // Add the agency owner as OWNER of the client workspace
  await prisma.workspaceMember.create({
    data: { workspaceId: clientWorkspace.id, userId: session.user.id, role: "OWNER" },
  });

  return NextResponse.json({ workspace: clientWorkspace }, { status: 201 });
}
