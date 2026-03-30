"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, TrendingDown, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  vendor: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "Software", "Marketing", "Travel", "Payroll", "Office", "Legal",
  "Accounting", "Hardware", "Advertising", "Utilities", "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Software: "#6366F1", Marketing: "#EC4899", Travel: "#F59E0B",
  Payroll: "#22C55E", Office: "#06B6D4", Legal: "#8B5CF6",
  Accounting: "#10B981", Hardware: "#F97316", Advertising: "#EF4444",
  Utilities: "#64748B", Other: "#6B7280",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ExpensesPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({
    description: "", amount: "", category: "Software",
    date: new Date().toISOString().split("T")[0], vendor: "",
  });

  const fetchExpenses = useCallback(async () => {
    const res = await fetch(`/api/payments/expenses?workspace=${workspaceSlug}`);
    if (res.ok) setExpenses((await res.json()).expenses);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleCreate = async () => {
    if (!form.description.trim() || !form.amount) { toast.error("Description and amount required"); return; }
    setCreating(true);
    const res = await fetch("/api/payments/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const { expense } = await res.json();
      setExpenses((p) => [expense, ...p]);
      setForm({ description: "", amount: "", category: "Software", date: new Date().toISOString().split("T")[0], vendor: "" });
      setOpen(false);
      toast.success("Expense logged");
    } else toast.error("Failed to log expense");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/payments/expenses/${id}`, { method: "DELETE" });
    if (res.ok) { setExpenses((p) => p.filter((e) => e.id !== id)); toast.success("Expense deleted"); }
    else toast.error("Failed to delete");
    setDeletingId(null);
  };

  const filtered = filterCat === "All" ? expenses : expenses.filter((e) => e.category === filterCat);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Expenses</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            Total: {fmt(expenses.reduce((s, e) => s + e.amount, 0))}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> Log Expense
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--obs-text)" }}>Log Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Description *</Label>
                <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Monthly Figma subscription" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Amount ($) *</Label>
                  <Input type="number" min="0" step="0.01" value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="45.00" style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Category</Label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Vendor</Label>
                  <Input value={form.vendor} onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
                    placeholder="Figma" style={inputStyle} />
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {creating ? "Saving…" : "Log Expense"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {byCategory.slice(0, 4).map(({ cat, total: catTotal }) => (
            <div key={cat} className="p-4 rounded-xl border"
              style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="w-2 h-2 rounded-full mb-2"
                style={{ background: CATEGORY_COLORS[cat] ?? "var(--obs-muted)" }} />
              <p className="text-base font-bold" style={{ color: "var(--obs-text)" }}>{fmt(catTotal)}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{cat}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-1 flex-wrap">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filterCat === c ? "var(--obs-accent)" : "var(--obs-elevated)",
              color: filterCat === c ? "#fff" : "var(--obs-muted)",
            }}>
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Description</span><span>Amount</span><span>Category</span><span>Vendor</span><span>Date</span><span />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingDown size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No expenses logged</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Track your business expenses here</p>
          </div>
        ) : (
          <>
            {filtered.map((e) => (
              <div key={e.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
                style={{ borderColor: "var(--obs-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{e.description}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--obs-danger)" }}>−{fmt(e.amount)}</p>
                <span className="text-xs px-2 py-1 rounded-md inline-block"
                  style={{ background: `${CATEGORY_COLORS[e.category] ?? "var(--obs-muted)"}18`, color: CATEGORY_COLORS[e.category] ?? "var(--obs-muted)" }}>
                  {e.category}
                </span>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{e.vendor ?? "—"}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                  {new Date(e.date).toLocaleDateString()}
                </p>
                <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id}
                  className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                  <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-t"
              style={{ borderColor: "var(--obs-border)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--obs-muted)" }}>
                {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--obs-danger)" }}>{fmt(total)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
