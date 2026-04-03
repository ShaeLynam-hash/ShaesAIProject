import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ serviceId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { serviceId } = await params;
  const body = await req.json();
  const service = await prisma.service.update({ where: { id: serviceId }, data: body });
  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { serviceId } = await params;
  await prisma.service.delete({ where: { id: serviceId } });
  return NextResponse.json({ ok: true });
}
