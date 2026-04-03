import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ appointmentId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { appointmentId } = await params;
  const body = await req.json();
  const appointment = await prisma.appointment.update({ where: { id: appointmentId }, data: body });
  return NextResponse.json({ appointment });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { appointmentId } = await params;
  await prisma.appointment.delete({ where: { id: appointmentId } });
  return NextResponse.json({ ok: true });
}
