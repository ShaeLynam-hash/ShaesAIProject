import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const documents = await prisma.document.findMany({ where: { workspaceId: workspace.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, title, emoji } = await req.json();
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const document = await prisma.document.create({ data: { workspaceId: workspace.id, title: title ?? "Untitled", emoji: emoji ?? "📄", createdById: session.user.id } });
  return NextResponse.json({ document }, { status: 201 });
}
