"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, BookMarked, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Account { id: string; code: string; name: string; type: string }
interface JournalLine { accountId: string; debit: string; credit: string; memo: string; account?: { code: string; name: string; type: string } }
interface JournalEntry {
  id: string;
  date: string;
  memo: string | null;
  reference: string | null;
  sourceType: string | null;
  createdAt: string;
  lines: Array<{ id: string; debit: number; credit: number; memo: string | null; account: { code: string; name: string; type: string } }>;
}

function fmt(n: number) {
  return n === 0 ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const EMPTY_LINE: JournalLine = { accountId: "", debit: "", credit: "", memo: "" };

export default function LedgerPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    memo: "",
    reference: "",
    lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] as JournalLine[],
  });

  const fetchData = useCallback(async () => {
    const [entriesRes, accountsRes] = await Promise.all([
      fetch(`/api/payments/ledger?workspace=${workspaceSlug}`),
      fetch(`/api/payments/accounts?workspace=${workspaceSlug}`),
    ]);
    if (entriesRes.ok) setEntries((await entriesRes.json()).entries);
    if (accountsRes.ok) setAccounts((await accountsRes.json()).accounts);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDebit = form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const updateLine = (idx: number, field: keyof JournalLine, val: string) => {
    setForm((p) => {
      const lines = [...p.lines];
      lines[idx] = { ...lines[idx], [field]: val };
      return { ...p, lines };
    });
  };

  const addLine = () => setForm((p) => ({ ...p, lines: [...p.lines, { ...EMPTY_LINE }] }));
  const removeLine = (idx: number) => setForm((p) => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    if (!balanced) { toast.error("Debits must equal credits"); return; }
    const validLines = form.lines.filter((l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0));
    if (validLines.length < 2) { toast.error("At least 2 lines required"); return; }

    setCreating(true);
    const res = await fetch("/api/payments/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        date: form.date,
        memo: form.memo || null,
        reference: form.reference || null,
        lines: validLines.map((l) => ({
          accountId: l.accountId,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          memo: l.memo || null,
        })),
      }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((p) => [entry, ...p]);
      setForm({ date: new Date().toISOString().split("T")[0], memo: "", reference: "", lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] });
      setOpen(false);
      toast.success("Journal entry recorded");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to record entry");
    }
    setCreating(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>General Ledger</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            Double-entry journal — all financial transactions
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> Journal Entry
          </DialogTrigger>
          <DialogContent className="max-w-2xl" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--obs-text)" }}>New Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Reference #</Label>
                  <Input value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} placeholder="JE-001" style={inputStyle} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Memo / Description</Label>
                <Input value={form.memo} onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))} placeholder="Payment received from client" style={inputStyle} />
              </div>

              {/* Lines */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--obs-border)" }}>
                <div className="grid grid-cols-[2fr_1fr_1fr_32px] gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                  <span>Account</span><span>Debit</span><span>Credit</span><span />
                </div>
                {form.lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_32px] gap-2 px-3 py-2 border-t"
                    style={{ borderColor: "var(--obs-border)" }}>
                    <select value={line.accountId} onChange={(e) => updateLine(i, "accountId", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none" style={inputStyle}>
                      <option value="">Select account…</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                    <Input type="number" min="0" step="0.01" value={line.debit}
                      onChange={(e) => updateLine(i, "debit", e.target.value)}
                      placeholder="0.00" className="text-xs" style={inputStyle} />
                    <Input type="number" min="0" step="0.01" value={line.credit}
                      onChange={(e) => updateLine(i, "credit", e.target.value)}
                      placeholder="0.00" className="text-xs" style={inputStyle} />
                    <button onClick={() => removeLine(i)} disabled={form.lines.length <= 2}
                      className="flex items-center justify-center p-1 rounded hover:bg-red-500/10 disabled:opacity-30">
                      <Trash2 size={12} style={{ color: "var(--obs-danger)" }} />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-[2fr_1fr_1fr_32px] gap-2 px-3 py-2 border-t text-xs font-semibold"
                  style={{ borderColor: "var(--obs-border)", background: "var(--obs-elevated)" }}>
                  <span style={{ color: "var(--obs-muted)" }}>Totals</span>
                  <span style={{ color: totalDebit > 0 ? "var(--obs-text)" : "var(--obs-muted)" }}>
                    {totalDebit > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalDebit) : "—"}
                  </span>
                  <span style={{ color: totalCredit > 0 ? "var(--obs-text)" : "var(--obs-muted)" }}>
                    {totalCredit > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalCredit) : "—"}
                  </span>
                  <span />
                </div>
              </div>

              {totalDebit > 0 && !balanced && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
                  style={{ background: "#EF444418", color: "#EF4444" }}>
                  <AlertCircle size={13} />
                  Difference: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(totalDebit - totalCredit))} — debits must equal credits
                </div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={addLine} className="text-xs font-medium flex items-center gap-1.5"
                  style={{ color: "var(--obs-accent)" }}>
                  <Plus size={12} /> Add line
                </button>
                <button onClick={handleCreate} disabled={creating || !balanced}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "var(--obs-accent)" }}>
                  {creating ? "Saving…" : "Post Entry"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries list */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[120px_2fr_1fr_1fr] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Date</span><span>Description</span><span>Debit</span><span>Credit</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <BookMarked size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No journal entries yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Post your first entry to start the ledger</p>
          </div>
        ) : entries.map((entry) => {
          const isOpen = expanded.has(entry.id);
          const totalDr = entry.lines.reduce((s, l) => s + l.debit, 0);
          const totalCr = entry.lines.reduce((s, l) => s + l.credit, 0);
          return (
            <div key={entry.id}>
              <button
                className="w-full grid grid-cols-[120px_2fr_1fr_1fr] gap-4 px-5 py-4 border-b items-center text-left hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--obs-border)" }}
                onClick={() => toggleExpand(entry.id)}>
                <p className="text-xs font-mono" style={{ color: "var(--obs-muted)" }}>
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>
                    {entry.memo ?? "Journal Entry"}
                  </p>
                  {entry.reference && (
                    <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Ref: {entry.reference}</p>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--obs-success)" }}>{fmt(totalDr)}</p>
                <p className="text-sm" style={{ color: "var(--obs-danger)" }}>{fmt(totalCr)}</p>
              </button>
              {isOpen && (
                <div className="border-b" style={{ borderColor: "var(--obs-border)", background: "var(--obs-elevated)" }}>
                  {entry.lines.map((line) => (
                    <div key={line.id}
                      className="grid grid-cols-[120px_2fr_1fr_1fr] gap-4 px-5 py-2.5 border-b items-center"
                      style={{ borderColor: "var(--obs-border)" }}>
                      <span className="text-xs font-mono" style={{ color: "var(--obs-muted)" }}>{line.account.code}</span>
                      <p className="text-xs pl-4" style={{ color: "var(--obs-muted)" }}>{line.account.name}</p>
                      <p className="text-xs" style={{ color: line.debit > 0 ? "var(--obs-success)" : "transparent" }}>
                        {fmt(line.debit)}
                      </p>
                      <p className="text-xs" style={{ color: line.credit > 0 ? "var(--obs-danger)" : "transparent" }}>
                        {fmt(line.credit)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
