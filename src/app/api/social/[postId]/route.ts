import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ postId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.content !== undefined) data.content = body.content;
  if (body.platforms !== undefined) data.platforms = body.platforms;
  if (body.scheduledAt !== undefined) {
    data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    data.status = body.scheduledAt ? "SCHEDULED" : "DRAFT";
  }
  if (body.status !== undefined) data.status = body.status;
  if (body.mediaUrls !== undefined) data.mediaUrls = body.mediaUrls;

  const post = await prisma.socialPost.update({ where: { id: postId }, data });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await params;
  await prisma.socialPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
