import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dealId } = await params;
  const body = await req.json();
  const deal = await prisma.deal.update({ where: { id: dealId }, data: body, include: { contact: true } });
  return NextResponse.json({ deal });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dealId } = await params;
  await prisma.deal.delete({ where: { id: dealId } });
  return NextResponse.json({ ok: true });
}
