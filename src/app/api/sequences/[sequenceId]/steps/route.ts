import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ sequenceId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  const { subject, body, delayDays, fromName, fromEmail } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Subject and body required" }, { status: 400 });

  const lastStep = await prisma.emailSequenceStep.findFirst({ where: { sequenceId }, orderBy: { stepNumber: "desc" } });
  const stepNumber = (lastStep?.stepNumber ?? 0) + 1;

  const step = await prisma.emailSequenceStep.create({
    data: { sequenceId, stepNumber, subject, body, delayDays: delayDays ?? 0, fromName: fromName || null, fromEmail: fromEmail || null },
  });
  return NextResponse.json({ step }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  const { stepId } = await req.json();
  await prisma.emailSequenceStep.deleteMany({ where: { id: stepId, sequenceId } });
  // Renumber remaining steps
  const remaining = await prisma.emailSequenceStep.findMany({ where: { sequenceId }, orderBy: { stepNumber: "asc" } });
  await Promise.all(remaining.map((s, i) => prisma.emailSequenceStep.update({ where: { id: s.id }, data: { stepNumber: i + 1 } })));
  return NextResponse.json({ ok: true });
}
