import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const campaigns = await prisma.emailCampaign.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, name, subject, fromName, fromEmail, htmlBody } = await req.json();
  if (!workspaceSlug || !name || !subject || !fromEmail) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const campaign = await prisma.emailCampaign.create({ data: { workspaceId: workspace.id, name, subject, fromName: fromName ?? "", fromEmail, htmlBody: htmlBody ?? "" } });
  return NextResponse.json({ campaign }, { status: 201 });
}
