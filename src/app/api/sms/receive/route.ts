import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return new NextResponse("Missing workspace", { status: 400 });

  let body: Record<string, string>;
  try {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text).entries());
  } catch {
    return new NextResponse("Invalid body", { status: 400 });
  }

  const from = body.From;
  const msgBody = body.Body;
  const twilioSid = body.MessageSid;

  if (!from || !msgBody) return new NextResponse("Missing fields", { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return new NextResponse("Workspace not found", { status: 404 });

  // Find matching contact by phone
  const contact = await prisma.contact.findFirst({
    where: { workspaceId: workspace.id, phone: from },
  });

  // Find or create conversation
  let convo = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, channel: "sms", contactPhone: from },
  });

  if (!convo) {
    const name = contact ? `${contact.firstName} ${contact.lastName ?? ""}`.trim() : from;
    convo = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        channel: "sms",
        contactPhone: from,
        contactName: name,
        contactId: contact?.id ?? null,
        lastMessageAt: new Date(),
      },
    });
  } else {
    await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
  }

  await prisma.conversationMessage.create({
    data: { conversationId: convo.id, direction: "inbound", body: msgBody, status: "received", externalId: twilioSid },
  });

  // ── AI Auto-Reply ────────────────────────────────────────
  if (workspace.aiAutoReply && process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const contactContext = contact
        ? `Contact: ${contact.firstName} ${contact.lastName ?? ""}, status: ${contact.status}${contact.company ? `, company: ${contact.company}` : ""}${contact.notes ? `, notes: ${contact.notes}` : ""}`
        : "Unknown contact";

      const systemPrompt = workspace.aiAutoReplyPrompt ||
        `You are a helpful SMS assistant for ${workspace.name}. Reply in a friendly, concise way (under 160 characters). Be helpful and professional. ${contactContext}`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system: systemPrompt,
        messages: [{ role: "user", content: msgBody }],
      });

      const replyText = response.content[0].type === "text"
        ? response.content[0].text.slice(0, 160)
        : null;

      if (replyText) {
        const accountSid = workspace.twilioSubAccountSid ?? workspace.twilioAccountSid ?? process.env.TWILIO_ACCOUNT_SID;
        const authToken  = workspace.twilioSubAccountToken ?? workspace.twilioAuthToken ?? process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = workspace.twilioPhoneNumber ?? workspace.twilioFromNumber ?? process.env.TWILIO_FROM_NUMBER;

        if (accountSid && authToken && fromNumber) {
          const client = twilio(accountSid, authToken);
          await client.messages.create({ body: replyText, from: fromNumber, to: from });

          await prisma.conversationMessage.create({
            data: { conversationId: convo.id, direction: "outbound", body: `[AI] ${replyText}`, status: "sent" },
          });
        }
      }
    } catch (e) {
      console.error("AI auto-reply failed:", e);
    }
  }

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
