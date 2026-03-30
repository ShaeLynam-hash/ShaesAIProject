import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tickets = await prisma.ticket.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, subject, description, fromEmail, fromName, priority } = await req.json();
  if (!workspaceSlug || !subject || !fromEmail) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ticket = await prisma.ticket.create({ data: { workspaceId: workspace.id, subject, description: description ?? "", fromEmail, fromName: fromName || null, priority: priority ?? "NORMAL" } });
  return NextResponse.json({ ticket }, { status: 201 });
}
