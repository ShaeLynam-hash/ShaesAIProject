import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await req.json();
  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId: session.user.id } } },
    include: { integrations: { where: { provider: "gohighlevel" } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const integration = workspace.integrations[0];
  if (!integration?.apiKey) return NextResponse.json({ error: "GoHighLevel not connected" }, { status: 400 });

  const config = integration.config as { locationId?: string } | null;
  const locationQuery = config?.locationId ? `&locationId=${config.locationId}` : "";

  let imported = 0;
  let page = 1;
  const pageSize = 100;

  while (true) {
    const res = await fetch(`https://rest.gohighlevel.com/v1/contacts/?limit=${pageSize}&skip=${(page - 1) * pageSize}${locationQuery}`, {
      headers: { Authorization: `Bearer ${integration.apiKey}` },
    });
    if (!res.ok) break;
    const data = await res.json();
    const contacts: any[] = data.contacts ?? [];
    if (contacts.length === 0) break;

    for (const c of contacts) {
      const firstName = c.firstName ?? c.name?.split(" ")[0] ?? "Unknown";
      const lastName = c.lastName ?? c.name?.split(" ").slice(1).join(" ") ?? undefined;
      await prisma.contact.upsert({
        where: { id: c.id ?? "noexist" },
        create: {
          id: c.id,
          workspaceId: workspace.id,
          firstName,
          lastName,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
          company: c.companyName ?? undefined,
          source: "gohighlevel",
          tags: c.tags ?? [],
        },
        update: {
          firstName,
          lastName,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
          company: c.companyName ?? undefined,
          tags: c.tags ?? [],
        },
      });
      imported++;
    }
    if (contacts.length < pageSize) break;
    page++;
  }

  await prisma.workspaceIntegration.update({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "gohighlevel" } },
    data: { lastSyncAt: new Date(), syncCount: { increment: imported } },
  });

  return NextResponse.json({ imported });
}
