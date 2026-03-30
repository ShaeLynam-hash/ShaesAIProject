"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Headphones, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Ticket { id: string; subject: string; description: string; status: string; priority: string; fromEmail: string; fromName: string | null; createdAt: string; }

const PRIORITIES = ["LOW","NORMAL","HIGH","URGENT"];
const STATUSES = ["OPEN","IN_PROGRESS","RESOLVED","CLOSED"];
const priorityColor: Record<string, string> = { LOW: "var(--obs-muted)", NORMAL: "#6366F1", HIGH: "#F59E0B", URGENT: "#EF4444" };
const statusColor: Record<string, string> = { OPEN: "#F59E0B", IN_PROGRESS: "#6366F1", RESOLVED: "#22C55E", CLOSED: "var(--obs-muted)" };

export default function TicketsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState({ subject: "", description: "", fromEmail: "", fromName: "", priority: "NORMAL" });

  const fetchTickets = useCallback(async () => {
    const res = await fetch(`/api/support/tickets?workspace=${workspaceSlug}`);
    if (res.ok) setTickets((await res.json()).tickets);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.fromEmail.trim()) { toast.error("Subject and email required"); return; }
    setCreating(true);
    const res = await fetch("/api/support/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form }) });
    if (res.ok) { const { ticket } = await res.json(); setTickets((p) => [ticket, ...p]); setForm({ subject: "", description: "", fromEmail: "", fromName: "", priority: "NORMAL" }); setOpen(false); toast.success("Ticket created"); }
    else toast.error("Failed to create");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/support/tickets/${id}`, { method: "DELETE" });
    if (res.ok) { setTickets((p) => p.filter((t) => t.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  const filtered = filterStatus === "All" ? tickets : tickets.filter((t) => t.status === filterStatus);
  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Tickets</h2><p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}><Plus size={15} /> New Ticket</DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Create Ticket</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Subject *</Label><Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Issue description" style={iStyle} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Email *</Label><Input type="email" value={form.fromEmail} onChange={(e) => setForm((p) => ({ ...p, fromEmail: e.target.value }))} placeholder="user@example.com" style={iStyle} /></div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Name</Label><Input value={form.fromName} onChange={(e) => setForm((p) => ({ ...p, fromName: e.target.value }))} placeholder="Jane Smith" style={iStyle} /></div>
              </div>
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Priority</Label>
                <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Description</Label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={iStyle} /></div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>{creating ? "Creating…" : "Create Ticket"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-1">
        {["All", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: filterStatus === s ? "var(--obs-accent)" : "var(--obs-elevated)", color: filterStatus === s ? "#fff" : "var(--obs-muted)" }}>{s.replace(/_/g, " ")}</button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Subject</span><span>From</span><span>Priority</span><span>Status</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : filtered.length === 0 ? (
          <div className="py-12 text-center"><Headphones size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No tickets</p></div>
        ) : filtered.map((t) => (
          <div key={t.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{t.subject}</p><p className="text-xs" style={{ color: "var(--obs-muted)" }}>{new Date(t.createdAt).toLocaleDateString()}</p></div>
            <div><p className="text-sm" style={{ color: "var(--obs-text)" }}>{t.fromName ?? "—"}</p><p className="text-xs" style={{ color: "var(--obs-muted)" }}>{t.fromEmail}</p></div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: `${priorityColor[t.priority]}18`, color: priorityColor[t.priority] }}>{t.priority}</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: `${statusColor[t.status]}18`, color: statusColor[t.status] }}>{t.status.replace(/_/g, " ")}</span>
            <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"><Trash2 size={14} style={{ color: "var(--obs-danger)" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
