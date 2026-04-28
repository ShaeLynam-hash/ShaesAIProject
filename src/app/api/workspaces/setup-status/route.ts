import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("workspace");
  if (!slug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const [workspace, emailIntegration] = await Promise.all([
    prisma.workspace.findUnique({
      where: { slug },
      select: {
        id: true, name: true, twilioPhoneNumber: true, fromEmail: true,
        _count: {
          select: { contacts: true, invoices: true, members: true, services: true, smsCampaigns: true, emailCampaigns: true },
        },
      },
    }),
    prisma.workspaceIntegration.findFirst({
      where: {
        workspace: { slug },
        provider: { in: ["gmail", "smtp"] },
        status: "active",
      },
    }).catch(() => null),
  ]);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const emailConnected = !!emailIntegration || !!workspace.fromEmail;

  const steps = [
    { id: "workspace", label: "Workspace created",          done: true,                                                href: null },
    { id: "email",     label: "Connect your email",         done: emailConnected,                                      href: "integrations" },
    { id: "contact",   label: "Add your first contact",     done: workspace._count.contacts > 0,                       href: "crm/contacts" },
    { id: "invoice",   label: "Create your first invoice",  done: workspace._count.invoices > 0,                       href: "payments/invoices" },
    { id: "booking",   label: "Set up booking services",    done: workspace._count.services > 0,                       href: "booking/services" },
    { id: "campaign",  label: "Send your first campaign",   done: workspace._count.emailCampaigns > 0 || workspace._count.smsCampaigns > 0, href: "email/campaigns" },
    { id: "team",      label: "Invite a teammate",          done: workspace._count.members > 1,                        href: "settings/team" },
  ];

  const completed = steps.filter((s) => s.done).length;

  return NextResponse.json({ steps, completed, total: steps.length });
}
