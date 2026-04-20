import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ contactId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  const notes = await prisma.contactNote.findMany({ where: { contactId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Note body required" }, { status: 400 });
  const note = await prisma.contactNote.create({ data: { contactId, body } });
  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  const { noteId } = await req.json();
  await prisma.contactNote.deleteMany({ where: { id: noteId, contactId } });
  return NextResponse.json({ ok: true });
}
