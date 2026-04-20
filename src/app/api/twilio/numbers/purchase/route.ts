import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, phoneNumber } = await req.json();
  if (!workspaceSlug || !phoneNumber) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!workspace.twilioSubAccountSid || !workspace.twilioSubAccountToken) {
    return NextResponse.json({ error: "Workspace not provisioned. Go to Settings → Communications → Set Up Messaging." }, { status: 400 });
  }

  // Release existing number if any
  if (workspace.twilioPhoneNumberSid && workspace.twilioSubAccountSid) {
    try {
      const oldClient = twilio(workspace.twilioSubAccountSid, workspace.twilioSubAccountToken);
      await oldClient.incomingPhoneNumbers(workspace.twilioPhoneNumberSid).remove();
    } catch {
      // Non-fatal — old number might already be released
    }
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "https://shaes-ai-project.vercel.app";
  const webhookUrl = `${appUrl}/api/sms/receive?workspace=${workspaceSlug}`;
  const voiceUrl   = `${appUrl}/api/twilio/voice?workspace=${workspaceSlug}`;

  try {
    const subClient = twilio(workspace.twilioSubAccountSid, workspace.twilioSubAccountToken);

    const purchased = await subClient.incomingPhoneNumbers.create({
      phoneNumber,
      smsUrl:      webhookUrl,
      smsMethod:   "POST",
      voiceUrl,
      voiceMethod: "POST",
    });

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        twilioPhoneNumber:    purchased.phoneNumber,
        twilioPhoneNumberSid: purchased.sid,
      },
    });

    return NextResponse.json({ phoneNumber: purchased.phoneNumber, sid: purchased.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Purchase failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
