"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Webhook, Trash2, Copy, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface WebhookEndpoint { id: string; url: string; events: string[]; secret: string; active: boolean; createdAt: string; deliveries?: { success: boolean }[]; }

const ALL_EVENTS = [
  "contact.created","contact.updated","deal.created","deal.stage_changed",
  "invoice.created","invoice.paid","invoice.overdue","customer.created",
  "ticket.created","ticket.resolved","automation.triggered",
];

export default function WebhooksPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ url: "", selectedEvents: ["contact.created"] as string[] });

  const fetchEndpoints = useCallback(async () => {
    const res = await fetch(`/api/webhooks/endpoints?workspace=${workspaceSlug}`);
    if (res.ok) setEndpoints((await res.json()).endpoints);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchEndpoints(); }, [fetchEndpoints]);

  const handleCreate = async () => {
    if (!form.url.trim()) { toast.error("URL required"); return; }
    if (!form.url.startsWith("http")) { toast.error("URL must start with https://"); return; }
    setCreating(true);
    const res = await fetch("/api/webhooks/endpoints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, url: form.url, events: form.selectedEvents }) });
    if (res.ok) { const { endpoint } = await res.json(); setEndpoints((p) => [endpoint, ...p]); setForm({ url: "", selectedEvents: ["contact.created"] }); setOpen(false); toast.success("Webhook added"); }
    else toast.error("Failed to add");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/webhooks/endpoints/${id}`, { method: "DELETE" });
    if (res.ok) { setEndpoints((p) => p.filter((e) => e.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  const copySecret = (secret: string) => { navigator.clipboard.writeText(secret); toast.success("Secret copied"); };

  const toggleEvent = (ev: string) => setForm((p) => ({ ...p, selectedEvents: p.selectedEvents.includes(ev) ? p.selectedEvents.filter((e) => e !== ev) : [...p.selectedEvents, ev] }));

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Webhooks</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}><Plus size={15} /> Add Endpoint</DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Add Webhook Endpoint</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Endpoint URL *</Label><Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://yourapp.com/webhooks" style={iStyle} /></div>
              <div className="space-y-2">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Events to Listen For</Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {ALL_EVENTS.map((ev) => (
                    <button key={ev} onClick={() => toggleEvent(ev)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left text-xs transition-colors"
                      style={{ background: form.selectedEvents.includes(ev) ? "var(--obs-accent)" : "var(--obs-elevated)", borderColor: form.selectedEvents.includes(ev) ? "var(--obs-accent)" : "var(--obs-border)", color: form.selectedEvents.includes(ev) ? "#fff" : "var(--obs-muted)" }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: form.selectedEvents.includes(ev) ? "#fff" : "var(--obs-muted)" }} />
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>{creating ? "Adding…" : "Add Endpoint"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : endpoints.length === 0 ? (
          <div className="py-12 text-center"><Webhook size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No endpoints yet</p><p className="text-xs" style={{ color: "var(--obs-muted)" }}>Add a URL to receive event notifications</p></div>
        ) : endpoints.map((ep) => (
          <div key={ep.id} className="p-5 border-b last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: ep.active ? "var(--obs-success)" : "var(--obs-danger)" }} />
                  <p className="text-sm font-medium font-mono truncate" style={{ color: "var(--obs-text)" }}>{ep.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] px-2 py-0.5 rounded font-mono truncate max-w-xs" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>{ep.secret.slice(0, 20)}…</code>
                  <button onClick={() => copySecret(ep.secret)} className="p-1 rounded hover:bg-white/5"><Copy size={11} style={{ color: "var(--obs-muted)" }} /></button>
                </div>
              </div>
              <button onClick={() => handleDelete(ep.id)} disabled={deletingId === ep.id} className="p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50 ml-3 shrink-0"><Trash2 size={14} style={{ color: "var(--obs-danger)" }} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {ep.events.map((ev) => (
                <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--obs-elevated)", color: "var(--obs-accent-2)" }}>{ev}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
