import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ contactId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      deals: { orderBy: { createdAt: "desc" } },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 5,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      contactNotes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contact });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  const body = await req.json();
  const contact = await prisma.contact.update({ where: { id: contactId }, data: body });
  return NextResponse.json({ contact });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contactId } = await params;
  await prisma.contact.delete({ where: { id: contactId } });
  return NextResponse.json({ ok: true });
}
