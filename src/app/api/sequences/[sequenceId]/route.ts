import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ sequenceId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  const sequence = await prisma.emailSequence.findUnique({
    where: { id: sequenceId },
    include: { steps: { orderBy: { stepNumber: "asc" } }, enrollments: { include: { contact: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { enrolledAt: "desc" }, take: 20 }, _count: { select: { enrollments: true } } },
  });
  if (!sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ sequence });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  const body = await req.json();
  const sequence = await prisma.emailSequence.update({ where: { id: sequenceId }, data: body });
  return NextResponse.json({ sequence });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  await prisma.emailSequence.delete({ where: { id: sequenceId } });
  return NextResponse.json({ ok: true });
}
