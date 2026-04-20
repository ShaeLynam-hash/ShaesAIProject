"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Deal {
  id: string; title: string; value: number; stage: string; probability: number;
  closeDate: string | null;
  contact: { firstName: string; lastName: string | null; company: string | null } | null;
}

const STAGES = [
  { key: "LEAD",        label: "Lead",        color: "#6366F1" },
  { key: "QUALIFIED",   label: "Qualified",   color: "#818CF8" },
  { key: "PROPOSAL",    label: "Proposal",    color: "#F59E0B" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#EC4899" },
  { key: "CLOSED_WON",  label: "Closed Won",  color: "#22C55E" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "#EF4444" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default function PipelinePage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", value: "", stage: "LEAD", probability: "20" });
  const dragDeal = useRef<string | null>(null);

  const fetchDeals = useCallback(async () => {
    const res = await fetch(`/api/crm/deals?workspace=${workspaceSlug}`);
    if (res.ok) setDeals((await res.json()).deals);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setCreating(true);
    const res = await fetch("/api/crm/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0 }),
    });
    if (res.ok) {
      const { deal } = await res.json();
      setDeals((p) => [deal, ...p]);
      setForm({ title: "", value: "", stage: "LEAD", probability: "20" });
      setOpen(false);
      toast.success("Deal created");
    } else toast.error("Failed to create");
    setCreating(false);
  };

  const moveDeal = async (dealId: string, newStage: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;
    // Optimistic update
    setDeals((p) => p.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));
    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (!res.ok) { setDeals((p) => p.map((d) => d.id === dealId ? { ...d, stage: deal.stage } : d)); toast.error("Failed to move deal"); }
    else toast.success(`Moved to ${STAGES.find((s) => s.key === newStage)?.label}`);
  };

  const onDragStart = (dealId: string) => {
    dragDeal.current = dealId;
    setDragging(dealId);
  };

  const onDragEnd = () => {
    setDragging(null);
    setDragOver(null);
    dragDeal.current = null;
  };

  const onDrop = (stageKey: string) => {
    if (dragDeal.current) moveDeal(dragDeal.current, stageKey);
    setDragOver(null);
  };

  const totalPipeline = deals.filter((d) => !["CLOSED_WON","CLOSED_LOST"].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Pipeline</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {deals.length} deals · {fmt(totalPipeline)} active pipeline
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Deal
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Create Deal</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Enterprise Contract" style={iStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Value ($)</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} placeholder="5000" style={iStyle} />
                </div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Stage</Label>
                  <select value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Create Deal"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-4" style={{ minHeight: 600 }}>
          {STAGES.map(({ key, label, color }) => {
            const stageDeals = deals.filter((d) => d.stage === key);
            const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
            const isOver = dragOver === key;

            return (
              <div key={key} className="min-w-[180px] flex flex-col"
                onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => onDrop(key)}>
                {/* Column header */}
                <div className="mb-2 px-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--obs-text)" }}>{label}</span>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>{stageDeals.length}</span>
                  </div>
                  <div className="text-xs font-bold px-1" style={{ color }}>{fmt(stageTotal)}</div>
                </div>

                {/* Drop zone */}
                <div className="flex-1 rounded-xl border-2 transition-colors p-2 space-y-2"
                  style={{
                    borderColor: isOver ? color : "var(--obs-border)",
                    background: isOver ? `${color}08` : "var(--obs-elevated)",
                    minHeight: 120,
                  }}>
                  {stageDeals.length === 0 ? (
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px]" style={{ color: "var(--obs-muted)" }}>
                        {isOver ? "Drop here" : "No deals"}
                      </span>
                    </div>
                  ) : stageDeals.map((deal) => (
                    <div key={deal.id}
                      draggable
                      onDragStart={() => onDragStart(deal.id)}
                      onDragEnd={onDragEnd}
                      className="p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-opacity select-none"
                      style={{
                        background: "var(--obs-surface)",
                        borderColor: "var(--obs-border)",
                        opacity: dragging === deal.id ? 0.4 : 1,
                      }}>
                      <p className="text-xs font-semibold mb-1 line-clamp-2" style={{ color: "var(--obs-text)" }}>{deal.title}</p>
                      <p className="text-xs font-bold" style={{ color }}>{fmt(deal.value)}</p>
                      {deal.contact && (
                        <p className="text-[10px] mt-1 truncate" style={{ color: "var(--obs-muted)" }}>
                          {deal.contact.firstName} {deal.contact.lastName ?? ""}
                          {deal.contact.company ? ` · ${deal.contact.company}` : ""}
                        </p>
                      )}
                      {deal.probability > 0 && (
                        <div className="mt-2 h-1 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: color, opacity: 0.7 }} />
                        </div>
                      )}
                      {deal.closeDate && (
                        <p className="text-[10px] mt-1" style={{ color: "var(--obs-muted)" }}>
                          {new Date(deal.closeDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary bar */}
      {!loading && deals.length > 0 && (
        <div className="rounded-xl border p-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Won</p>
              <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{fmt(deals.filter((d) => d.stage === "CLOSED_WON").reduce((s,d)=>s+d.value,0))}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Active Pipeline</p>
              <p className="text-sm font-bold" style={{ color: "var(--obs-text)" }}>{fmt(totalPipeline)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Lost</p>
              <p className="text-sm font-bold" style={{ color: "#EF4444" }}>{fmt(deals.filter((d) => d.stage === "CLOSED_LOST").reduce((s,d)=>s+d.value,0))}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
