import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ automationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { automationId } = await params;
  const body = await req.json();
  const automation = await prisma.automation.update({ where: { id: automationId }, data: body });
  return NextResponse.json({ automation });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ automationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { automationId } = await params;
  await prisma.automation.delete({ where: { id: automationId } });
  return NextResponse.json({ ok: true });
}
