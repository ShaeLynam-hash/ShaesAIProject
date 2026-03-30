import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrendingUp, Users, Receipt, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export default async function PaymentsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    paidThisPeriod,
    paidLastPeriod,
    outstandingInvoices,
    customerCount,
    recentInvoices,
    expenseTotal,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.customer.count({ where: { workspaceId: workspace.id } }),
    prisma.invoice.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.expense.aggregate({
      where: { workspaceId: workspace.id, date: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
  ]);

  const revenue = paidThisPeriod._sum.total ?? 0;
  const lastRevenue = paidLastPeriod._sum.total ?? 0;
  const revenueChange = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0;
  const outstanding = outstandingInvoices._sum.total ?? 0;
  const expenses = expenseTotal._sum.amount ?? 0;
  const profit = revenue - expenses;

  const statusColor: Record<string, string> = {
    DRAFT: "var(--obs-muted)",
    SENT: "#F59E0B",
    PAID: "var(--obs-success)",
    OVERDUE: "var(--obs-danger)",
    VOID: "var(--obs-muted)",
  };

  const stats = [
    {
      label: "Revenue (30d)",
      value: fmt(revenue),
      change: revenueChange,
      icon: TrendingUp,
      color: "var(--obs-success)",
    },
    {
      label: "Outstanding",
      value: fmt(outstanding),
      sub: `${outstandingInvoices._count} invoice${outstandingInvoices._count !== 1 ? "s" : ""}`,
      icon: AlertCircle,
      color: "#F59E0B",
    },
    {
      label: "Customers",
      value: customerCount.toLocaleString(),
      icon: Users,
      color: "var(--obs-accent)",
    },
    {
      label: "Net Profit (30d)",
      value: fmt(profit),
      sub: `${fmt(expenses)} expenses`,
      icon: Receipt,
      color: profit >= 0 ? "var(--obs-success)" : "var(--obs-danger)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Payments & Finance</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Revenue, invoices, expenses, and financial reports
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, change, sub, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
              {change !== undefined && (
                <div className="flex items-center gap-0.5 text-xs font-medium"
                  style={{ color: change >= 0 ? "var(--obs-success)" : "var(--obs-danger)" }}>
                  {change >= 0
                    ? <ArrowUpRight size={12} />
                    : <ArrowDownRight size={12} />}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: "var(--obs-muted)" }}>{label}</p>
            {sub && <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Recent Invoices</h3>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Customer</span><span>Invoice</span><span>Amount</span><span>Status</span>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>
            No invoices yet — create your first one
          </div>
        ) : recentInvoices.map((inv) => (
          <div key={inv.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>
                {inv.customer?.name ?? "No customer"}
              </p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                {inv.customer?.email ?? "—"}
              </p>
            </div>
            <p className="text-sm font-mono" style={{ color: "var(--obs-muted)" }}>{inv.number}</p>
            <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{fmt(inv.total)}</p>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
              style={{
                background: `${statusColor[inv.status]}18`,
                color: statusColor[inv.status],
              }}>
              {inv.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
