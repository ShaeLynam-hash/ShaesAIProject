import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

interface Ctx { params: Promise<{ campaignId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId } = await params;
  const { workspaceSlug, segment } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.workspaceId !== workspace.id) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "SENT") return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });

  const apiKey = workspace.resendApiKey ?? process.env.RESEND_API_KEY;
  const fromEmail = workspace.fromEmail ?? process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const fromName = workspace.fromName ?? workspace.name;

  if (!apiKey) {
    return NextResponse.json({ error: "Resend not configured. Add API key in Settings → Communications." }, { status: 400 });
  }

  const statusFilter = segment === "leads" ? { status: "LEAD" } : segment === "clients" ? { status: "CLIENT" } : {};
  const contacts = await prisma.contact.findMany({
    where: { workspaceId: workspace.id, email: { not: null }, ...statusFilter },
    select: { firstName: true, lastName: true, email: true },
  });

  if (contacts.length === 0) {
    return NextResponse.json({ error: "No contacts with email addresses found" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [contact.email!],
        subject: campaign.subject,
        html: campaign.htmlBody || `<p>${campaign.subject}</p>`,
      });
      sent++;
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      recipientCount: sent + failed,
    },
  });

  return NextResponse.json({ sent, failed, total: contacts.length });
}
