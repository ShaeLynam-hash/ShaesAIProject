import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("workspace");
  if (!slug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    select: {
      id: true, name: true, twilioPhoneNumber: true, resendApiKey: true, fromEmail: true,
      _count: {
        select: { contacts: true, invoices: true, members: true, appointments: true, smsCampaigns: true, emailCampaigns: true },
      },
    },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const steps = [
    { id: "workspace",   label: "Workspace created",        done: true,                                           href: null },
    { id: "contact",     label: "Add your first contact",   done: workspace._count.contacts > 0,                  href: "crm/contacts" },
    { id: "invoice",     label: "Create an invoice",        done: workspace._count.invoices > 0,                  href: "payments/invoices" },
    { id: "sms",         label: "Set up your phone number", done: !!workspace.twilioPhoneNumber,                  href: "settings/communications" },
    { id: "email",       label: "Connect email (Resend)",   done: !!(workspace.resendApiKey && workspace.fromEmail), href: "settings/communications" },
    { id: "team",        label: "Invite a teammate",        done: workspace._count.members > 1,                   href: "settings/team" },
    { id: "booking",     label: "Set up booking services",  done: workspace._count.appointments > 0,              href: "booking/services" },
    { id: "campaign",    label: "Send your first campaign", done: workspace._count.emailCampaigns > 0 || workspace._count.smsCampaigns > 0, href: "email/campaigns" },
  ];

  const completed = steps.filter((s) => s.done).length;

  return NextResponse.json({ steps, completed, total: steps.length });
}
