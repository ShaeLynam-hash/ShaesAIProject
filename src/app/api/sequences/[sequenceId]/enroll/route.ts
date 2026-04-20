import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ sequenceId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sequenceId } = await params;
  const { contactIds, workspaceSlug } = await req.json();

  const sequence = await prisma.emailSequence.findUnique({ where: { id: sequenceId }, include: { steps: { orderBy: { stepNumber: "asc" }, take: 1 } } });
  if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const firstStep = sequence.steps[0];
  const nextSendAt = firstStep ? new Date(Date.now() + firstStep.delayDays * 86400000) : null;

  let enrolled = 0;
  let skipped = 0;

  for (const contactId of (contactIds as string[])) {
    try {
      await prisma.sequenceEnrollment.create({
        data: { sequenceId, workspaceId: workspace.id, contactId, currentStep: 0, status: "ACTIVE", nextSendAt },
      });
      enrolled++;
    } catch {
      skipped++; // Already enrolled
    }
  }

  return NextResponse.json({ enrolled, skipped });
}
