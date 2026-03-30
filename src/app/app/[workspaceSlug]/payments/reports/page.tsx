import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

function getMonthRange(monthsAgo: number) {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth() - monthsAgo, 1);
  const end = new Date(d.getFullYear(), d.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
  return { start, end, label: start.toLocaleString("default", { month: "short", year: "2-digit" }) };
}

export default async function ReportsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  // Build 6-month P&L
  const months = Array.from({ length: 6 }, (_, i) => getMonthRange(5 - i));

  const monthlyData = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [rev, exp] = await Promise.all([
        prisma.invoice.aggregate({
          where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: start, lte: end } },
          _sum: { total: true },
        }),
        prisma.expense.aggregate({
          where: { workspaceId: workspace.id, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);
      const revenue = rev._sum.total ?? 0;
      const expenses = exp._sum.amount ?? 0;
      return { label, revenue, expenses, profit: revenue - expenses };
    })
  );

  // YTD totals
  const ytdStart = new Date(new Date().getFullYear(), 0, 1);
  const [ytdRev, ytdExp, expByCategory] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: ytdStart } },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: { workspaceId: workspace.id, date: { gte: ytdStart } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { workspaceId: workspace.id, date: { gte: ytdStart } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  const totalRevenue = ytdRev._sum.total ?? 0;
  const totalExpenses = ytdExp._sum.amount ?? 0;
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const maxBar = Math.max(...monthlyData.map((m) => Math.max(m.revenue, m.expenses)), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Financial Reports</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Year-to-date · {new Date().getFullYear()}
        </p>
      </div>

      {/* YTD summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: fmt(totalRevenue),  icon: TrendingUp,   color: "var(--obs-success)" },
          { label: "Total Expenses", value: fmt(totalExpenses), icon: TrendingDown, color: "var(--obs-danger)"  },
          { label: "Net Profit",     value: fmt(netProfit),     icon: DollarSign,   color: netProfit >= 0 ? "var(--obs-success)" : "var(--obs-danger)" },
          { label: "Profit Margin",  value: `${margin.toFixed(1)}%`, icon: BarChart3, color: "var(--obs-accent)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${color}18` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* 6-month bar chart */}
      <div className="p-5 rounded-xl border"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--obs-text)" }}>
          Revenue vs Expenses — Last 6 Months
        </h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(({ label, revenue, expenses }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 h-32">
                <div className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${(revenue / maxBar) * 100}%`,
                    background: "var(--obs-success)",
                    opacity: 0.8,
                    minHeight: revenue > 0 ? "4px" : "0",
                  }} />
                <div className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${(expenses / maxBar) * 100}%`,
                    background: "var(--obs-danger)",
                    opacity: 0.6,
                    minHeight: expenses > 0 ? "4px" : "0",
                  }} />
              </div>
              <span className="text-[10px]" style={{ color: "var(--obs-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "var(--obs-success)" }} />
            <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "var(--obs-danger)", opacity: 0.6 }} />
            <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Expenses</span>
          </div>
        </div>
      </div>

      {/* Monthly P&L table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
            Profit & Loss Statement
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Month</span><span>Revenue</span><span>Expenses</span><span>Net Profit</span>
        </div>
        {monthlyData.map(({ label, revenue, expenses, profit }) => (
          <div key={label}
            className="grid grid-cols-4 gap-4 px-5 py-3.5 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{label}</p>
            <p className="text-sm" style={{ color: "var(--obs-success)" }}>{fmt(revenue)}</p>
            <p className="text-sm" style={{ color: "var(--obs-danger)" }}>{fmt(expenses)}</p>
            <p className="text-sm font-semibold"
              style={{ color: profit >= 0 ? "var(--obs-success)" : "var(--obs-danger)" }}>
              {profit >= 0 ? "+" : ""}{fmt(profit)}
            </p>
          </div>
        ))}
      </div>

      {/* Expense breakdown */}
      {expByCategory.length > 0 && (
        <div className="p-5 rounded-xl border"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>
            Expenses by Category (YTD)
          </h3>
          <div className="space-y-3">
            {expByCategory.map(({ category, _sum }) => {
              const amount = _sum.amount ?? 0;
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>{category}</span>
                    <span className="text-xs" style={{ color: "var(--obs-muted)" }}>
                      {fmt(amount)} · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--obs-accent)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
