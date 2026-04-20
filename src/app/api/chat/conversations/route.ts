import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET — auth required — list conversations for inbox
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { chatWidget: { select: { id: true } } },
  });
  if (!workspace?.chatWidget) return NextResponse.json({ conversations: [] });

  const status = req.nextUrl.searchParams.get("status") ?? "OPEN";

  const conversations = await prisma.chatConversation.findMany({
    where: { widgetId: workspace.chatWidget.id, status },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ conversations });
}

// POST — public — start or resume a conversation
export async function POST(req: NextRequest) {
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const { visitorId, visitorName, visitorEmail } = await req.json();
  if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { chatWidget: { select: { id: true, enabled: true, welcomeMessage: true } } },
  });
  if (!workspace?.chatWidget?.enabled) return NextResponse.json({ error: "Chat not available" }, { status: 404 });

  const widgetId = workspace.chatWidget.id;

  // Find existing open conversation or create new one
  let conversation = await prisma.chatConversation.findFirst({
    where: { widgetId, visitorId, status: "OPEN" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    conversation = await prisma.chatConversation.create({
      data: {
        widgetId,
        visitorId,
        visitorName: visitorName || null,
        visitorEmail: visitorEmail || null,
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    // Create welcome message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "agent",
        content: workspace.chatWidget.welcomeMessage,
      },
    });

    // Re-fetch with welcome message
    conversation = await prisma.chatConversation.findUnique({
      where: { id: conversation.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }) as typeof conversation;
  }

  return NextResponse.json({ conversation }, { headers: CORS });
}
