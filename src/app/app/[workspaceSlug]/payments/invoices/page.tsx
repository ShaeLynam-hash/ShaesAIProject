"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Receipt, Send, CheckCircle, Trash2 } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  dueDate: string;
  createdAt: string;
  customer: { name: string; email: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:   { bg: "#6B6B7618", text: "var(--obs-muted)"    },
  SENT:    { bg: "#F59E0B18", text: "#F59E0B"              },
  PAID:    { bg: "#22C55E18", text: "var(--obs-success)"  },
  OVERDUE: { bg: "#EF444418", text: "var(--obs-danger)"   },
  VOID:    { bg: "#6B6B7618", text: "var(--obs-muted)"    },
};

const FILTERS = ["All", "DRAFT", "SENT", "PAID", "OVERDUE"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function InvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    const res = await fetch(`/api/payments/invoices?workspace=${workspaceSlug}`);
    if (res.ok) setInvoices((await res.json()).invoices);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/payments/invoices/${id}`, { method: "DELETE" });
    if (res.ok) { setInvoices((p) => p.filter((i) => i.id !== id)); toast.success("Invoice deleted"); }
    else toast.error("Failed to delete");
    setDeletingId(null);
  };

  const markPaid = async (id: string) => {
    setMarkingId(id);
    const res = await fetch(`/api/payments/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    if (res.ok) {
      setInvoices((p) => p.map((i) => i.id === id ? { ...i, status: "PAID" } : i));
      toast.success("Marked as paid");
    } else toast.error("Failed to update");
    setMarkingId(null);
  };

  const filtered = filter === "All" ? invoices : invoices.filter((i) => i.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Invoices</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => router.push(`/app/${workspaceSlug}/payments/invoices/new`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--obs-accent)" }}>
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === f ? "var(--obs-accent)" : "var(--obs-elevated)",
              color: filter === f ? "#fff" : "var(--obs-muted)",
            }}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Invoice</span><span>Customer</span><span>Amount</span><span>Due</span><span>Status</span><span />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No invoices</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create your first invoice to get started</p>
          </div>
        ) : filtered.map((inv) => {
          const sc = STATUS_COLORS[inv.status] ?? STATUS_COLORS.DRAFT;
          const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < new Date();
          return (
            <div key={inv.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 border-b items-center last:border-0"
              style={{ borderColor: "var(--obs-border)" }}>
              <code className="text-xs font-mono" style={{ color: "var(--obs-accent-2)" }}>{inv.number}</code>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>
                  {inv.customer?.name ?? "No customer"}
                </p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{inv.customer?.email ?? "—"}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{fmt(inv.total)}</p>
              <p className="text-xs" style={{ color: isOverdue ? "var(--obs-danger)" : "var(--obs-muted)" }}>
                {new Date(inv.dueDate).toLocaleDateString()}
              </p>
              <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
                style={{ background: sc.bg, color: sc.text }}>{inv.status}</span>
              <div className="flex items-center gap-1">
                {(inv.status === "DRAFT" || inv.status === "SENT") && (
                  <button onClick={() => markPaid(inv.id)} disabled={markingId === inv.id}
                    title="Mark as paid"
                    className="p-1.5 rounded-lg hover:bg-green-500/10 disabled:opacity-50">
                    <CheckCircle size={13} style={{ color: "var(--obs-success)" }} />
                  </button>
                )}
                {inv.status === "DRAFT" && (
                  <button title="Send invoice"
                    className="p-1.5 rounded-lg hover:bg-white/5">
                    <Send size={13} style={{ color: "var(--obs-muted)" }} />
                  </button>
                )}
                <button onClick={() => handleDelete(inv.id)} disabled={deletingId === inv.id}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                  <Trash2 size={13} style={{ color: "var(--obs-danger)" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
