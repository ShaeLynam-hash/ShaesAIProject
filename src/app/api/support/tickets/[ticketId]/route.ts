import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId } = await params;
  const body = await req.json();
  const ticket = await prisma.ticket.update({ where: { id: ticketId }, data: body });
  return NextResponse.json({ ticket });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId } = await params;
  await prisma.ticket.delete({ where: { id: ticketId } });
  return NextResponse.json({ ok: true });
}
