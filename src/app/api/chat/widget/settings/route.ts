import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true, chatWidget: true },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ widget: workspace.chatWidget });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, enabled, widgetColor, welcomeMessage, teamName, teamAvatar, aiEnabled, aiPrompt } = await req.json();
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (enabled !== undefined) data.enabled = !!enabled;
  if (widgetColor !== undefined) data.widgetColor = widgetColor;
  if (welcomeMessage !== undefined) data.welcomeMessage = welcomeMessage;
  if (teamName !== undefined) data.teamName = teamName;
  if (teamAvatar !== undefined) data.teamAvatar = teamAvatar || null;
  if (aiEnabled !== undefined) data.aiEnabled = !!aiEnabled;
  if (aiPrompt !== undefined) data.aiPrompt = aiPrompt || null;

  const widget = await prisma.chatWidget.upsert({
    where: { workspaceId: workspace.id },
    create: { workspaceId: workspace.id, ...data },
    update: data,
  });

  return NextResponse.json({ widget });
}
