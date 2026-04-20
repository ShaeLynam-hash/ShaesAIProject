import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

// Twilio calls this when someone calls the workspace's phone number.
// We auto-text them back if missedCallTextBack is enabled.
export async function POST(req: NextRequest) {
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return twiml("<Response><Hangup/></Response>");

  let body: Record<string, string>;
  try {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text).entries());
  } catch {
    return twiml("<Response><Hangup/></Response>");
  }

  const callerNumber = body.From;
  if (!callerNumber) return twiml("<Response><Hangup/></Response>");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return twiml("<Response><Hangup/></Response>");

  // Send missed-call text-back if enabled
  if (workspace.missedCallTextBack) {
    const msg = workspace.missedCallMessage ||
      `Hi! You just called ${workspace.name}. We missed you — how can we help? Reply to this message and we'll get back to you right away!`;

    const accountSid = workspace.twilioSubAccountSid ?? workspace.twilioAccountSid ?? process.env.TWILIO_ACCOUNT_SID;
    const authToken  = workspace.twilioSubAccountToken ?? workspace.twilioAuthToken ?? process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = workspace.twilioPhoneNumber ?? workspace.twilioFromNumber ?? process.env.TWILIO_FROM_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        const client = twilio(accountSid, authToken);
        await client.messages.create({ body: msg, from: fromNumber, to: callerNumber });

        // Log to conversation
        let convo = await prisma.conversation.findFirst({
          where: { workspaceId: workspace.id, channel: "sms", contactPhone: callerNumber },
        });
        if (!convo) {
          convo = await prisma.conversation.create({
            data: { workspaceId: workspace.id, channel: "sms", contactPhone: callerNumber, contactName: callerNumber, lastMessageAt: new Date() },
          });
        } else {
          await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
        }
        await prisma.conversationMessage.create({
          data: { conversationId: convo.id, direction: "outbound", body: msg, status: "sent" },
        });
      } catch (e) {
        console.error("Missed call text-back failed:", e);
      }
    }
  }

  // Return TwiML — play a brief message then hang up
  const businessName = workspace.name.replace(/[<>&"]/g, "");
  return twiml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thanks for calling ${businessName}. We missed your call but we just sent you a text message. We look forward to speaking with you soon!</Say>
  <Hangup/>
</Response>`);
}

function twiml(xml: string) {
  return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
