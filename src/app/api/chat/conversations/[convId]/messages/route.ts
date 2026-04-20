import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Ctx = { params: Promise<{ convId: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET — public — poll for messages
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { convId } = await params;
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages }, { headers: CORS });
}

// POST — visitor (public) or agent (auth)
export async function POST(req: NextRequest, { params }: Ctx) {
  const { convId } = await params;
  const body = await req.json();
  const { role, content, visitorId } = body as { role: string; content: string; visitorId?: string };

  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  // Agent must be authenticated
  if (role === "agent") {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    // Visitor — validate visitorId matches conversation
    const conv = await prisma.chatConversation.findUnique({ where: { id: convId }, select: { visitorId: true } });
    if (!conv || conv.visitorId !== visitorId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.chatMessage.create({
    data: { conversationId: convId, role: role === "agent" ? "agent" : "visitor", content: content.trim() },
  });

  await prisma.chatConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });

  // AI auto-reply for visitor messages
  if (role === "visitor") {
    // Fire and forget — don't block response
    (async () => {
      try {
        const conv = await prisma.chatConversation.findUnique({
          where: { id: convId },
          include: {
            widget: { include: { workspace: { select: { name: true } } } },
            messages: { orderBy: { createdAt: "asc" }, take: 20 },
          },
        });
        if (!conv?.widget?.aiEnabled || !process.env.ANTHROPIC_API_KEY) return;

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const systemPrompt = conv.widget.aiPrompt || `You are a helpful customer support assistant for ${conv.widget.workspace.name}. Be friendly, concise, and helpful. Keep responses under 3 sentences.`;

        const msgs = conv.messages
          .filter(m => m.role !== "ai")
          .map(m => ({ role: m.role === "visitor" ? "user" as const : "assistant" as const, content: m.content }));

        if (msgs.length === 0 || msgs[msgs.length - 1].role !== "user") return;

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          system: systemPrompt,
          messages: msgs,
        });

        const aiText = response.content[0]?.type === "text" ? response.content[0].text : null;
        if (aiText) {
          await prisma.chatMessage.create({ data: { conversationId: convId, role: "ai", content: aiText } });
          await prisma.chatConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });
        }
      } catch { /* silent fail */ }
    })();
  }

  return NextResponse.json({ message }, { headers: CORS });
}
