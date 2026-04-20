import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

interface Ctx { params: Promise<{ campaignId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId } = await params;
  const { workspaceSlug, segment } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const campaign = await prisma.smsCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.workspaceId !== workspace.id) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "SENT") return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });

  // Resolve credentials: sub-account → override → env
  const accountSid = workspace.twilioSubAccountSid   ?? workspace.twilioAccountSid   ?? process.env.TWILIO_ACCOUNT_SID;
  const authToken  = workspace.twilioSubAccountToken ?? workspace.twilioAuthToken    ?? process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = workspace.twilioPhoneNumber     ?? workspace.twilioFromNumber   ?? process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ error: "SMS not configured. Go to Settings → Communications to set up your phone number." }, { status: 400 });
  }

  // Reset monthly counter if new month
  const now = new Date();
  const resetAt = workspace.smsUsageResetAt;
  if (!resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.workspace.update({ where: { id: workspace.id }, data: { smsUsageThisMonth: 0, smsUsageResetAt: now } });
    workspace.smsUsageThisMonth = 0;
  }

  const statusFilter = segment === "leads" ? { status: "LEAD" } : segment === "clients" ? { status: "CLIENT" } : {};
  const contacts = await prisma.contact.findMany({
    where: { workspaceId: workspace.id, phone: { not: null }, ...statusFilter },
    select: { phone: true },
  });

  if (contacts.length === 0) return NextResponse.json({ error: "No contacts with phone numbers found" }, { status: 400 });

  // Check headroom
  const headroom = workspace.smsMonthlyLimit - workspace.smsUsageThisMonth;
  if (headroom <= 0) {
    return NextResponse.json({ error: `Monthly SMS limit reached (${workspace.smsMonthlyLimit}). Upgrade your plan.` }, { status: 429 });
  }

  const toSend = contacts.slice(0, headroom);
  const client = twilio(accountSid, authToken);
  let sent = 0;
  let failed = 0;

  for (const contact of toSend) {
    try {
      await client.messages.create({ body: campaign.message, from: fromNumber, to: contact.phone! });
      sent++;
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  // Update usage + campaign
  await prisma.$transaction([
    prisma.workspace.update({
      where: { id: workspace.id },
      data: { smsUsageThisMonth: { increment: sent } },
    }),
    prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: "SENT", sentAt: now, recipientCount: sent + failed, deliveredCount: sent },
    }),
  ]);

  const skipped = contacts.length - toSend.length;
  return NextResponse.json({ sent, failed, skipped, total: contacts.length });
}
