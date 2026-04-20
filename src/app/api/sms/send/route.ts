import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

function shouldResetUsage(workspace: { smsUsageResetAt: Date | null }) {
  if (!workspace.smsUsageResetAt) return true;
  const now = new Date();
  const reset = new Date(workspace.smsUsageResetAt);
  return now.getMonth() !== reset.getMonth() || now.getFullYear() !== reset.getFullYear();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, to, body, conversationId, contactName } = await req.json();
  if (!workspaceSlug || !to || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reset monthly counter if new month
  if (shouldResetUsage(workspace)) {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { smsUsageThisMonth: 0, smsUsageResetAt: new Date() },
    });
    workspace.smsUsageThisMonth = 0;
  }

  // Enforce plan limit
  if (workspace.smsUsageThisMonth >= workspace.smsMonthlyLimit) {
    return NextResponse.json({
      error: `Monthly SMS limit reached (${workspace.smsMonthlyLimit}). Upgrade your plan to send more.`,
    }, { status: 429 });
  }

  // Resolve credentials: sub-account → workspace-level override → master env
  const accountSid = workspace.twilioSubAccountSid   ?? workspace.twilioAccountSid   ?? process.env.TWILIO_ACCOUNT_SID;
  const authToken  = workspace.twilioSubAccountToken ?? workspace.twilioAuthToken    ?? process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = workspace.twilioPhoneNumber     ?? workspace.twilioFromNumber   ?? process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ error: "SMS not configured. Go to Settings → Communications to set up your phone number." }, { status: 400 });
  }

  let twilioSid: string | undefined;
  let status = "sent";

  try {
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({ body, from: fromNumber, to });
    twilioSid = msg.sid;
    status = msg.status;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Twilio error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Increment usage
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { smsUsageThisMonth: { increment: 1 } },
  });

  // Find or create conversation
  let convo = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId } })
    : await prisma.conversation.findFirst({ where: { workspaceId: workspace.id, channel: "sms", contactPhone: to } });

  if (!convo) {
    convo = await prisma.conversation.create({
      data: { workspaceId: workspace.id, channel: "sms", contactPhone: to, contactName: contactName ?? to, lastMessageAt: new Date() },
    });
  } else {
    await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
  }

  const message = await prisma.conversationMessage.create({
    data: { conversationId: convo.id, direction: "outbound", body, status, externalId: twilioSid },
  });

  return NextResponse.json({ message, conversation: convo }, { status: 201 });
}
