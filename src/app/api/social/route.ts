import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = req.nextUrl.searchParams.get("status");
  const posts = await prisma.socialPost.findMany({
    where: { workspaceId: workspace.id, ...(status ? { status } : {}) },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, content, platforms, scheduledAt, mediaUrls } = await req.json();
  if (!workspaceSlug || !content || !platforms?.length) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = await prisma.socialPost.create({
    data: {
      workspaceId: workspace.id,
      content,
      platforms,
      mediaUrls: mediaUrls ?? [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "SCHEDULED" : "DRAFT",
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
