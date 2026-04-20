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

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, name, description, color, contactId, dueDate } = await req.json();
  if (!workspaceSlug || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name,
      description: description || null,
      color: color || "#6366F1",
      contactId: contactId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
