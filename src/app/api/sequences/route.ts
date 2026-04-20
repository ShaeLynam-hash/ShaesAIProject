import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: slug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const sequences = await prisma.emailSequence.findMany({
    where: { workspaceId: workspace.id },
    include: { steps: { orderBy: { stepNumber: "asc" } }, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ sequences });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, name, description, trigger, triggerValue } = await req.json();
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const sequence = await prisma.emailSequence.create({
    data: { workspaceId: workspace.id, name, description: description || null, trigger: trigger || "manual", triggerValue: triggerValue || null },
    include: { steps: true, _count: { select: { enrollments: true } } },
  });
  return NextResponse.json({ sequence }, { status: 201 });
}
