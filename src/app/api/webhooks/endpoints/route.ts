import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const endpoints = await prisma.webhookEndpoint.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, include: { deliveries: { select: { success: true }, take: 20, orderBy: { createdAt: "desc" } } } });
  return NextResponse.json({ endpoints });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, url, events } = await req.json();
  if (!workspaceSlug || !url) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const secret = `whsec_${randomBytes(24).toString("hex")}`;
  const endpoint = await prisma.webhookEndpoint.create({ data: { workspaceId: workspace.id, url, events: events ?? [], secret } });
  return NextResponse.json({ endpoint }, { status: 201 });
}
