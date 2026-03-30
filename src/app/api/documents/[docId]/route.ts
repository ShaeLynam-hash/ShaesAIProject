import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { docId } = await params;
  const document = await prisma.document.findUnique({ where: { id: docId } });
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ document });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { docId } = await params;
  const body = await req.json();
  const document = await prisma.document.update({ where: { id: docId }, data: { ...body, updatedAt: new Date() } });
  return NextResponse.json({ document });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { docId } = await params;
  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ ok: true });
}
