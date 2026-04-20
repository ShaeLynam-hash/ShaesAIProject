import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Scale, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default async function BalanceSheetPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const wid = workspace.id;

  // ── Compute Balance Sheet from real data ────────────────────────────────────
  // ASSETS
  const [arTotal, paidRevenue, totalExpenses, outstandingInvoices, totalExpenseAmount] = await Promise.all([
    // Accounts Receivable = sum of outstanding invoices
    prisma.invoice.aggregate({
      where: { workspaceId: wid, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { total: true },
    }),
    // Revenue (paid invoices all time)
    prisma.invoice.aggregate({
      where: { workspaceId: wid, status: "PAID" },
      _sum: { total: true },
    }),
    // Total expenses all time
    prisma.expense.aggregate({
      where: { workspaceId: wid },
      _sum: { amount: true },
    }),
    prisma.invoice.count({ where: { workspaceId: wid, status: { in: ["SENT", "OVERDUE"] } } }),
    prisma.expense.aggregate({ where: { workspaceId: wid }, _sum: { amount: true } }),
  ]);

  // Compute journal-based balances
  const journalLines = await prisma.journalLine.findMany({
    where: { journalEntry: { workspaceId: wid } },
    include: { account: { select: { code: true, name: true, type: true, subtype: true } } },
  });

  // Build account balances from journal lines
  const accountBalances: Record<string, { name: string; code: string; type: string; subtype: string | null; balance: number }> = {};
  for (const line of journalLines) {
    const key = line.accountId;
    if (!accountBalances[key]) {
      accountBalances[key] = { name: line.account.name, code: line.account.code, type: line.account.type, subtype: line.account.subtype, balance: 0 };
    }
    // Normal balances: Assets/Expenses debit-normal, Liabilities/Equity/Revenue credit-normal
    const isDebitNormal = line.account.type === "ASSET" || line.account.type === "EXPENSE";
    if (isDebitNormal) {
      accountBalances[key].balance += line.debit - line.credit;
    } else {
      accountBalances[key].balance += line.credit - line.debit;
    }
  }

  const balancesByType = (type: string) =>
    Object.values(accountBalances).filter((a) => a.type === type && a.balance !== 0);

  const journalAssets = balancesByType("ASSET");
  const journalLiabilities = balancesByType("LIABILITY");
  const journalEquity = balancesByType("EQUITY");
  const journalRevenue = balancesByType("REVENUE");
  const journalExpenses = balancesByType("EXPENSE");

  // Derived values (mix of invoices/expenses and journal)
  const accountsReceivable = arTotal._sum.total ?? 0;
  const totalPaidRevenue = paidRevenue._sum.total ?? 0;
  const totalExpenseAmt = totalExpenseAmount._sum.amount ?? 0;
  const retainedEarnings = totalPaidRevenue - totalExpenseAmt;

  const journalAssetTotal = journalAssets.reduce((s, a) => s + a.balance, 0);
  const journalLiabilityTotal = journalLiabilities.reduce((s, a) => s + a.balance, 0);
  const journalEquityTotal = journalEquity.reduce((s, a) => s + a.balance, 0);

  // Simplified balance sheet
  const assets = [
    { name: "Accounts Receivable", amount: accountsReceivable, note: `${outstandingInvoices} outstanding invoices` },
    ...journalAssets.map((a) => ({ name: a.name, amount: a.balance, note: `${a.code} · ${a.subtype ?? a.type}` })),
  ];
  const liabilities = [
    ...journalLiabilities.map((a) => ({ name: a.name, amount: a.balance, note: `${a.code} · ${a.subtype ?? a.type}` })),
  ];
  const equity = [
    { name: "Retained Earnings", amount: retainedEarnings, note: "Revenue − Expenses (all time)" },
    ...journalEquity.map((a) => ({ name: a.name, amount: a.balance, note: `${a.code}` })),
  ];

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.amount, 0);
  const totalEquity = equity.reduce((s, a) => s + a.amount, 0);
  const checkTotal = totalLiabilities + totalEquity;
  const balanced = Math.abs(totalAssets - checkTotal) < 1;

  const asOf = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Balance Sheet</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>As of {asOf}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold`}
          style={{
            background: balanced ? "var(--obs-success)18" : "#EF444418",
            color: balanced ? "var(--obs-success)" : "#EF4444",
          }}>
          <Scale size={12} />
          {balanced ? "Balanced" : "Unbalanced"}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Assets",      value: fmt(totalAssets),      icon: TrendingUp,   color: "var(--obs-success)" },
          { label: "Total Liabilities", value: fmt(totalLiabilities), icon: TrendingDown, color: "var(--obs-danger)"  },
          { label: "Total Equity",      value: fmt(totalEquity),      icon: DollarSign,   color: "var(--obs-accent)"  },
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

      <div className="grid grid-cols-2 gap-5">
        {/* ASSETS */}
        <Section title="Assets" total={totalAssets} color="var(--obs-success)" items={assets} />

        <div className="space-y-5">
          {/* LIABILITIES */}
          <Section title="Liabilities" total={totalLiabilities} color="var(--obs-danger)" items={liabilities} emptyLabel="No liabilities recorded" />
          {/* EQUITY */}
          <Section title="Equity" total={totalEquity} color="var(--obs-accent)" items={equity} />
        </div>
      </div>

      {/* Accounting equation */}
      <div className="p-4 rounded-xl border text-center"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "var(--obs-muted)" }}>Accounting Equation</p>
        <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
          Assets ({fmt(totalAssets)}) = Liabilities ({fmt(totalLiabilities)}) + Equity ({fmt(totalEquity)})
        </p>
        {!balanced && (
          <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
            Difference of {fmt(Math.abs(totalAssets - checkTotal))} — post journal entries to balance
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, total, color, items, emptyLabel }: {
  title: string;
  total: number;
  color: string;
  items: Array<{ name: string; amount: number; note?: string }>;
  emptyLabel?: string;
}) {
  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
      <div className="px-5 py-3.5 border-b flex items-center justify-between"
        style={{ borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{title}</h3>
        </div>
        <span className="text-sm font-bold" style={{ color }}>{fmt(total)}</span>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-4 text-xs" style={{ color: "var(--obs-muted)" }}>
          {emptyLabel ?? `No ${title.toLowerCase()} entries`}
        </div>
      ) : (
        <>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b last:border-0"
              style={{ borderColor: "var(--obs-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{item.name}</p>
                {item.note && <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{item.note}</p>}
              </div>
              <span className="text-sm font-semibold" style={{ color: item.amount >= 0 ? color : "var(--obs-danger)" }}>
                {fmt(item.amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: "var(--obs-border)", background: "var(--obs-elevated)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>
              Total {title}
            </span>
            <span className="text-sm font-bold" style={{ color }}>{fmt(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
