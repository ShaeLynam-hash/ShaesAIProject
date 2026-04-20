import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ convId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { convId } = await params;
  const { status } = await req.json();

  const conv = await prisma.chatConversation.update({
    where: { id: convId },
    data: { status: status ?? "CLOSED" },
  });

  return NextResponse.json({ conversation: conv });
}
