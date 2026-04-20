import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Users, DollarSign, Mail, Zap, TrendingUp, CalendarCheck, Receipt, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { WelcomeWizard } from "@/components/onboarding/WelcomeWizard";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

// ── Stat cards (streamed) ──────────────────────────────────────────────────
async function Stats({ workspaceId, base }: { workspaceId: string; base: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [contactCount, revenueData, lastMonthRevenue, appointmentCount, campaignCount] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.invoice.aggregate({ where: { workspaceId, status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { workspaceId, status: "PAID", paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
    prisma.appointment.count({ where: { workspaceId, status: "CONFIRMED" } }),
    prisma.emailCampaign.count({ where: { workspaceId } }),
  ]);

  const revenue = revenueData._sum.total ?? 0;
  const prevRevenue = lastMonthRevenue._sum.total ?? 0;
  const revenueChange = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

  const stats = [
    { label: "Total Contacts", value: contactCount.toLocaleString(), sub: contactCount === 0 ? "Add your first contact" : "Total in CRM", icon: Users, color: "#6366f1", href: `${base}/crm`, trend: null },
    { label: "Revenue This Month", value: fmt(revenue), sub: revenueChange !== null ? `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs last month` : "No prior data", icon: DollarSign, color: "#22c55e", href: `${base}/payments`, trend: revenueChange },
    { label: "Confirmed Bookings", value: appointmentCount.toLocaleString(), sub: "Active confirmed", icon: CalendarCheck, color: "#F59E0B", href: `${base}/booking`, trend: null },
    { label: "Email Campaigns", value: campaignCount.toLocaleString(), sub: campaignCount === 0 ? "Create first campaign" : "Campaigns created", icon: Mail, color: "#8b5cf6", href: `${base}/email`, trend: null },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {stats.map(({ label, value, sub, icon: Icon, color, href, trend }) => (
        <Link key={label} href={href} style={{ textDecoration: "none" }}>
          <div style={{ padding: "20px 22px", background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} style={{ color }} />
              </div>
              {trend !== null && (
                <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
                  <TrendingUp size={12} style={{ transform: trend < 0 ? "scaleY(-1)" : "none" }} />
                  {trend >= 0 ? "+" : ""}{trend}%
                </span>
              )}
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#F2F2F5", letterSpacing: "-0.02em", marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{label}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ padding: "20px 22px", background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, height: 120 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.05)", marginBottom: 14 }} />
          <div style={{ height: 28, width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 12, width: "80%", background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ── Recent contacts (streamed) ────────────────────────────────────────────
async function RecentContacts({ workspaceId, base }: { workspaceId: string; base: string }) {
  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } }),
    prisma.contact.count({ where: { workspaceId } }),
  ]);

  return (
    <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F5" }}>Recent Contacts</h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{total} total</p>
        </div>
        <Link href={`${base}/crm`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#F59E0B", fontWeight: 600, textDecoration: "none" }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div>
        {contacts.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>No contacts yet</p>
            <Link href={`${base}/crm`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#6366f1", textDecoration: "none", padding: "7px 14px", background: "rgba(99,102,241,0.1)", borderRadius: 7 }}>
              <Plus size={12} /> Add first contact
            </Link>
          </div>
        ) : contacts.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#6366f1", flexShrink: 0 }}>
              {c.firstName?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#F2F2F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.firstName} {c.lastName}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email ?? "—"}</p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent invoices (streamed) ────────────────────────────────────────────
async function RecentInvoices({ workspaceId, base }: { workspaceId: string; base: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [invoices, revenueData] = await Promise.all([
    prisma.invoice.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, total: true, status: true, createdAt: true } }),
    prisma.invoice.aggregate({ where: { workspaceId, status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { total: true } }),
  ]);
  const revenue = revenueData._sum.total ?? 0;

  return (
    <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F5" }}>Recent Invoices</h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>This month: {fmt(revenue)}</p>
        </div>
        <Link href={`${base}/payments/invoices`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#F59E0B", fontWeight: 600, textDecoration: "none" }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div>
        {invoices.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>No invoices yet</p>
            <Link href={`${base}/payments/invoices`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#22c55e", textDecoration: "none", padding: "7px 14px", background: "rgba(34,197,94,0.1)", borderRadius: 7 }}>
              <Plus size={12} /> Create invoice
            </Link>
          </div>
        ) : invoices.map((inv) => {
          const statusColor = inv.status === "PAID" ? "#22c55e" : inv.status === "SENT" ? "#F59E0B" : "rgba(255,255,255,0.3)";
          return (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Receipt size={13} style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#F2F2F5" }}>{fmt(inv.total)}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: `${statusColor}18`, padding: "3px 8px", borderRadius: 5 }}>
                {inv.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ height: 14, width: 120, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ height: 10, width: "40%", background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
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
  const base = `/app/${workspaceSlug}`;

  const trialDays = workspace.trialEndsAt
    ? Math.max(0, Math.ceil((workspace.trialEndsAt.getTime() - Date.now()) / 86400000))
    : null;

  const quickActions = [
    { label: "Add Contact",       href: `${base}/crm`,               icon: Users,        color: "#6366f1" },
    { label: "Create Invoice",    href: `${base}/payments/invoices`,  icon: Receipt,      color: "#22c55e" },
    { label: "New Booking",       href: `${base}/booking`,            icon: CalendarCheck,color: "#F59E0B" },
    { label: "Send Campaign",     href: `${base}/email`,              icon: Mail,         color: "#8b5cf6" },
    { label: "Build Automation",  href: `${base}/automations`,        icon: Zap,          color: "#ec4899" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F2F2F5", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"} 👋
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
            Here&apos;s what&apos;s happening with{" "}
            <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{workspace.name}</span> today.
          </p>
        </div>
        {trialDays !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
            <span style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600 }}>{trialDays} days left in trial</span>
            <Link href={`${base}/settings/billing`} style={{ fontSize: 12, color: "#0a0800", background: "#F59E0B", padding: "4px 10px", borderRadius: 6, fontWeight: 700, textDecoration: "none" }}>
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {/* Stats — stream in while page shell is already visible */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats workspaceId={workspace.id} base={base} />
      </Suspense>

      {/* Main content row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>

        {/* Recent Contacts */}
        <Suspense fallback={<ListSkeleton />}>
          <RecentContacts workspaceId={workspace.id} base={base} />
        </Suspense>

        {/* Recent Invoices */}
        <Suspense fallback={<ListSkeleton />}>
          <RecentInvoices workspaceId={workspace.id} base={base} />
        </Suspense>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick Actions */}
          <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F5" }}>Quick Actions</h3>
            </div>
            <div style={{ padding: "8px" }}>
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, textDecoration: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Dynamic setup wizard — shows welcome modal on first visit */}
          <WelcomeWizard workspaceSlug={workspaceSlug} workspaceName={workspace.name} />
        </div>
      </div>
    </div>
  );
}
