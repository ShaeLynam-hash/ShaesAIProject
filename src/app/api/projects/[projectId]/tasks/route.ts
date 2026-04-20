import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { workspaceId: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, description, status, priority, assigneeId, dueDate } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const count = await prisma.task.count({ where: { projectId } });
  const task = await prisma.task.create({
    data: {
      projectId,
      workspaceId: project.workspaceId,
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: count,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
