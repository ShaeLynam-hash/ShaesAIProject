import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ proposalId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { proposalId } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ proposal });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { proposalId } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.content !== undefined) data.content = body.content;
  if (body.total !== undefined) data.total = body.total;
  if (body.status !== undefined) data.status = body.status;
  if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null;
  if (body.contactId !== undefined) data.contactId = body.contactId || null;
  if (body.sentAt !== undefined) data.sentAt = body.sentAt ? new Date(body.sentAt) : null;

  const proposal = await prisma.proposal.update({ where: { id: proposalId }, data });
  return NextResponse.json({ proposal });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { proposalId } = await params;
  await prisma.proposal.delete({ where: { id: proposalId } });
  return NextResponse.json({ ok: true });
}
