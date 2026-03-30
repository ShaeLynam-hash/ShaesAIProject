import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const deals = await prisma.deal.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, include: { contact: true } });
  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, title, value, stage, probability, closeDate, notes, contactId } = await req.json();
  if (!workspaceSlug || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const deal = await prisma.deal.create({
    data: { workspaceId: workspace.id, title, value: value ?? 0, stage: stage ?? "LEAD", probability: probability ?? 0, closeDate: closeDate ? new Date(closeDate) : null, notes: notes || null, contactId: contactId || null },
    include: { contact: true },
  });
  return NextResponse.json({ deal }, { status: 201 });
}
