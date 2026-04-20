"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  subtype: string | null;
  description: string | null;
  isSystem: boolean;
  active: boolean;
}

const TYPE_ORDER: ChartAccount["type"][] = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

const TYPE_META: Record<ChartAccount["type"], { label: string; color: string; bg: string }> = {
  ASSET:     { label: "Assets",      color: "#22C55E", bg: "#22C55E18" },
  LIABILITY: { label: "Liabilities", color: "#EF4444", bg: "#EF444418" },
  EQUITY:    { label: "Equity",      color: "#6366F1", bg: "#6366F118" },
  REVENUE:   { label: "Revenue",     color: "#F59E0B", bg: "#F59E0B18" },
  EXPENSE:   { label: "Expenses",    color: "#EC4899", bg: "#EC489918" },
};

export default function AccountsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", type: "ASSET" as ChartAccount["type"], subtype: "", description: "" });

  const fetchAccounts = useCallback(async () => {
    const res = await fetch(`/api/payments/accounts?workspace=${workspaceSlug}`);
    if (res.ok) setAccounts((await res.json()).accounts);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error("Code and name required"); return; }
    setCreating(true);
    const res = await fetch("/api/payments/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form }),
    });
    if (res.ok) {
      const { account } = await res.json();
      setAccounts((p) => [...p, account].sort((a, b) => a.code.localeCompare(b.code)));
      setForm({ code: "", name: "", type: "ASSET", subtype: "", description: "" });
      setOpen(false);
      toast.success("Account created");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create account");
    }
    setCreating(false);
  };

  const handleEdit = async (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    const name = prompt("Account name:", acc.name);
    if (!name || name === acc.name) return;
    const res = await fetch(`/api/payments/accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subtype: acc.subtype, description: acc.description }),
    });
    if (res.ok) {
      const { account } = await res.json();
      setAccounts((p) => p.map((a) => (a.id === id ? account : a)));
      toast.success("Account updated");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account? If it has transactions, it will be deactivated instead.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/payments/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAccounts((p) => p.filter((a) => a.id !== id));
      toast.success("Account removed");
    } else toast.error("Failed to remove");
    setDeletingId(null);
  };

  const toggleCollapse = (type: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    accounts: accounts.filter((a) => a.type === type),
  }));

  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Chart of Accounts</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {accounts.length} accounts · organized by type
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Account
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--obs-text)" }}>Add Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Account Code *</Label>
                  <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="6100" style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Type *</Label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ChartAccount["type"] }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                    {TYPE_ORDER.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Account Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Bank Fees" style={inputStyle} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Subtype</Label>
                <Input value={form.subtype} onChange={(e) => setForm((p) => ({ ...p, subtype: e.target.value }))}
                  placeholder="Operating Expense" style={inputStyle} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional notes" style={inputStyle} />
              </div>
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Create Account"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading accounts…</div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ type, accounts: typeAccounts }) => {
            const meta = TYPE_META[type];
            const isCollapsed = collapsed.has(type);
            return (
              <div key={type} className="rounded-xl border overflow-hidden"
                style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                {/* Section header */}
                <button
                  className="w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/5"
                  onClick={() => toggleCollapse(type)}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{meta.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: meta.bg, color: meta.color }}>
                      {typeAccounts.length}
                    </span>
                  </div>
                  {isCollapsed
                    ? <ChevronRight size={14} style={{ color: "var(--obs-muted)" }} />
                    : <ChevronDown size={14} style={{ color: "var(--obs-muted)" }} />}
                </button>

                {!isCollapsed && (
                  <>
                    <div className="grid grid-cols-[80px_2fr_1fr_40px_40px] gap-4 px-5 py-2 border-t text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                      <span>Code</span><span>Name</span><span>Subtype</span><span /><span />
                    </div>
                    {typeAccounts.length === 0 ? (
                      <div className="px-5 py-4 text-sm" style={{ color: "var(--obs-muted)", borderTop: `1px solid var(--obs-border)` }}>
                        No accounts in this category yet
                      </div>
                    ) : typeAccounts.map((acc) => (
                      <div key={acc.id}
                        className="grid grid-cols-[80px_2fr_1fr_40px_40px] gap-4 px-5 py-3.5 border-t items-center"
                        style={{ borderColor: "var(--obs-border)" }}>
                        <span className="text-xs font-mono font-semibold"
                          style={{ color: meta.color }}>{acc.code}</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{acc.name}</p>
                          {acc.description && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{acc.description}</p>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{acc.subtype ?? "—"}</span>
                        <button onClick={() => handleEdit(acc.id)}
                          className="flex items-center justify-center p-1.5 rounded-lg hover:bg-white/5">
                          <Pencil size={13} style={{ color: "var(--obs-muted)" }} />
                        </button>
                        {!acc.isSystem && (
                          <button onClick={() => handleDelete(acc.id)} disabled={deletingId === acc.id}
                            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                            <Trash2 size={13} style={{ color: "var(--obs-danger)" }} />
                          </button>
                        )}
                        {acc.isSystem && <div />}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="py-16 text-center">
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No accounts found</p>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Default accounts will be created automatically</p>
        </div>
      )}
    </div>
  );
}
