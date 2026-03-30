"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, TrendingUp, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Deal {
  id: string; title: string; value: number; currency: string; stage: string;
  probability: number; closeDate: string | null; notes: string | null; createdAt: string;
  contact: { firstName: string; lastName: string | null; company: string | null } | null;
}

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
const STAGE_COLORS: Record<string, string> = {
  LEAD: "#6366F1", QUALIFIED: "#818CF8", PROPOSAL: "#F59E0B",
  NEGOTIATION: "#EC4899", CLOSED_WON: "#22C55E", CLOSED_LOST: "#EF4444",
};

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n); }

export default function DealsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState("All");
  const [form, setForm] = useState({ title: "", value: "", stage: "LEAD", probability: "20", closeDate: "", notes: "" });

  const fetchDeals = useCallback(async () => {
    const res = await fetch(`/api/crm/deals?workspace=${workspaceSlug}`);
    if (res.ok) setDeals((await res.json()).deals);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Deal title required"); return; }
    setCreating(true);
    const res = await fetch("/api/crm/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0 }) });
    if (res.ok) { const { deal } = await res.json(); setDeals((p) => [deal, ...p]); setForm({ title: "", value: "", stage: "LEAD", probability: "20", closeDate: "", notes: "" }); setOpen(false); toast.success("Deal created"); }
    else toast.error("Failed to create deal");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/crm/deals/${id}`, { method: "DELETE" });
    if (res.ok) { setDeals((p) => p.filter((d) => d.id !== id)); toast.success("Deal deleted"); }
    setDeletingId(null);
  };

  const filtered = filterStage === "All" ? deals : deals.filter((d) => d.stage === filterStage);
  const totalValue = filtered.reduce((s, d) => s + d.value, 0);
  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Deals</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""} · {fmt(deals.reduce((s, d) => s + d.value, 0))} pipeline</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Deal
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Create Deal</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Deal Title *</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Enterprise Contract — Acme" style={iStyle} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Value ($)</Label><Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} placeholder="5000" style={iStyle} /></div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Probability (%)</Label><Input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm((p) => ({ ...p, probability: e.target.value }))} placeholder="20" style={iStyle} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Stage</Label>
                  <select value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                    {STAGES.map((s) => <option key={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Close Date</Label><Input type="date" value={form.closeDate} onChange={(e) => setForm((p) => ({ ...p, closeDate: e.target.value }))} style={iStyle} /></div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Create Deal"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {["All", ...STAGES].map((s) => (
          <button key={s} onClick={() => setFilterStage(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: filterStage === s ? "var(--obs-accent)" : "var(--obs-elevated)", color: filterStage === s ? "#fff" : "var(--obs-muted)" }}>
            {s === "All" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Deal</span><span>Value</span><span>Stage</span><span>Probability</span><span>Close Date</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No deals</p>
          </div>
        ) : (
          <>
            {filtered.map((d) => (
              <div key={d.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{d.title}</p>
                  {d.contact && <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{d.contact.firstName} {d.contact.lastName ?? ""}{d.contact.company ? ` · ${d.contact.company}` : ""}</p>}
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{fmt(d.value)}</p>
                <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: `${STAGE_COLORS[d.stage] ?? "#6366F1"}18`, color: STAGE_COLORS[d.stage] ?? "#6366F1" }}>
                  {d.stage.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: `${d.probability}%`, background: "var(--obs-accent)" }} />
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--obs-muted)" }}>{d.probability}%</span>
                </div>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{d.closeDate ? new Date(d.closeDate).toLocaleDateString() : "—"}</p>
                <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                  <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-t" style={{ borderColor: "var(--obs-border)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--obs-muted)" }}>{filtered.length} deal{filtered.length !== 1 ? "s" : ""}</span>
              <span className="text-sm font-bold" style={{ color: "var(--obs-text)" }}>{fmt(totalValue)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
