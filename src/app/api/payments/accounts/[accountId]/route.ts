import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ accountId: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId } = await params;
  const { name, subtype, description } = await req.json();

  const account = await prisma.chartAccount.update({
    where: { id: accountId },
    data: { name, subtype: subtype || null, description: description || null },
  });

  return NextResponse.json({ account });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId } = await params;

  // Soft delete — only deactivate if it has journal lines
  const lineCount = await prisma.journalLine.count({ where: { accountId } });
  if (lineCount > 0) {
    await prisma.chartAccount.update({ where: { id: accountId }, data: { active: false } });
  } else {
    await prisma.chartAccount.delete({ where: { id: accountId } });
  }

  return NextResponse.json({ ok: true });
}
