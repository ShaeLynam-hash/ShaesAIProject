import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const proposals = await prisma.proposal.findMany({
    where: { workspaceId: workspace.id },
    include: { contact: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ proposals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, title, contactId, validUntil } = await req.json();
  if (!workspaceSlug || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const proposal = await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      title,
      contactId: contactId || null,
      validUntil: validUntil ? new Date(validUntil) : null,
      content: [
        { type: "heading", data: { text: title, level: 1 } },
        { type: "text", data: { text: "Thank you for considering our services. This proposal outlines our recommended approach and investment." } },
        { type: "lineItems", data: { items: [{ description: "Service", qty: 1, unitPrice: 0 }] } },
        { type: "signature", data: { label: "Client Signature" } },
      ],
    },
  });

  return NextResponse.json({ proposal }, { status: 201 });
}
