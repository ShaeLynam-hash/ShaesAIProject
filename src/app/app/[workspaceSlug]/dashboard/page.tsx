import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, DollarSign, Mail, Zap, ArrowUpRight, CheckCircle2, Circle, CalendarCheck, Receipt } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) redirect("/onboarding");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [contactCount, revenueData, appointmentCount, campaignCount] = await Promise.all([
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.appointment.count({ where: { workspaceId: workspace.id, status: "CONFIRMED" } }),
    prisma.emailCampaign.count({ where: { workspaceId: workspace.id } }),
  ]);

  const revenue = revenueData._sum.total ?? 0;

  const stats = [
    { label: "Total Contacts", value: contactCount.toLocaleString(), icon: Users, color: "#6366f1" },
    { label: "Revenue This Month", value: fmt(revenue), icon: DollarSign, color: "#16a34a" },
    { label: "Confirmed Bookings", value: appointmentCount.toLocaleString(), icon: CalendarCheck, color: "#F59E0B" },
    { label: "Email Campaigns", value: campaignCount.toLocaleString(), icon: Mail, color: "#8b5cf6" },
  ];

  const quickActions = [
    { label: "New Contact", href: `crm`, icon: Users },
    { label: "Create Invoice", href: `payments/invoices`, icon: Receipt },
    { label: "Schedule Booking", href: `booking`, icon: CalendarCheck },
    { label: "Send Campaign", href: `email`, icon: Mail },
    { label: "Build Automation", href: `automations`, icon: Zap },
  ];

  const checklist = [
    { label: "Create your workspace", done: true },
    { label: "Add your first contact", done: contactCount > 0, href: "crm" },
    { label: "Create your first invoice", done: false, href: "payments/invoices" },
    { label: "Set up booking services", done: false, href: "booking/services" },
    { label: "Invite a teammate", done: false, href: "settings/team" },
  ];

  const base = `/app/${workspaceSlug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>
          Welcome to {workspace.name} 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Here's an overview of your business today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <ArrowUpRight size={14} style={{ color: "var(--obs-muted)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Quick Actions</h3>
          </div>
          <div className="p-3 space-y-1">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={`${base}/${href}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--obs-text)" }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: "var(--obs-elevated)" }}>
                  <Icon size={13} style={{ color: "var(--obs-accent)" }} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Setup Checklist */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Getting Started</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>
              {checklist.filter(c => c.done).length}/{checklist.length} complete
            </p>
          </div>
          <div className="p-4 space-y-2">
            {checklist.map(({ label, done, href }) => {
              const inner = (
                <div className="flex items-center gap-3 py-1">
                  {done
                    ? <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                    : <Circle size={16} style={{ color: "var(--obs-muted)", flexShrink: 0 }} />}
                  <span className="text-sm" style={{ color: done ? "var(--obs-muted)" : "var(--obs-text)", textDecoration: done ? "line-through" : "none" }}>
                    {label}
                  </span>
                </div>
              );
              return href && !done
                ? <Link key={label} href={`${base}/${href}`}>{inner}</Link>
                : <div key={label}>{inner}</div>;
            })}
          </div>
        </div>

        {/* Trial banner */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Your Trial</h3>
          </div>
          <div className="p-5 space-y-4">
            {workspace.trialEndsAt ? (
              <>
                <div>
                  <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
                    {Math.max(0, Math.ceil((workspace.trialEndsAt.getTime() - Date.now()) / 86400000))}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--obs-muted)" }}>days remaining in free trial</p>
                </div>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                  All features unlocked. No credit card required until trial ends.
                </p>
                <Link href={`${base}/settings/billing`}
                  className="block text-center py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "var(--obs-accent)", color: "#000" }}>
                  Upgrade Plan
                </Link>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No active trial.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
