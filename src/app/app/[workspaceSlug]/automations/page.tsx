"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Zap, Trash2, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Automation { id: string; name: string; trigger: Record<string, string>; actions: Record<string, string>[]; active: boolean; runCount: number; lastRunAt: string | null; createdAt: string; }

const TRIGGERS = [
  { id: "contact.created",   label: "New Contact Created"      },
  { id: "deal.stage_changed",label: "Deal Stage Changed"        },
  { id: "invoice.paid",      label: "Invoice Paid"              },
  { id: "invoice.overdue",   label: "Invoice Overdue"           },
  { id: "form.submitted",    label: "Form Submitted"            },
  { id: "schedule.daily",    label: "Daily Schedule"            },
  { id: "schedule.weekly",   label: "Weekly Schedule"           },
];

const ACTIONS = [
  { id: "email.send",        label: "Send Email"                },
  { id: "sms.send",          label: "Send SMS"                  },
  { id: "contact.tag",       label: "Tag Contact"               },
  { id: "deal.update_stage", label: "Update Deal Stage"         },
  { id: "ai.summarize",      label: "AI: Summarize"             },
  { id: "webhook.call",      label: "Call Webhook"              },
  { id: "notification.send", label: "Send In-App Notification"  },
];

export default function AutomationsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", triggerId: "contact.created", actionId: "email.send" });

  const fetchAutomations = useCallback(async () => {
    const res = await fetch(`/api/automations?workspace=${workspaceSlug}`);
    if (res.ok) setAutomations((await res.json()).automations);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setCreating(true);
    const trigger = TRIGGERS.find((t) => t.id === form.triggerId)!;
    const action = ACTIONS.find((a) => a.id === form.actionId)!;
    const res = await fetch("/api/automations", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, name: form.name, trigger: { type: trigger.id, label: trigger.label }, actions: [{ type: action.id, label: action.label }] }) });
    if (res.ok) { const { automation } = await res.json(); setAutomations((p) => [automation, ...p]); setForm({ name: "", triggerId: "contact.created", actionId: "email.send" }); setOpen(false); toast.success("Automation created"); }
    else toast.error("Failed to create");
    setCreating(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    const res = await fetch(`/api/automations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    if (res.ok) setAutomations((p) => p.map((a) => a.id === id ? { ...a, active: !active } : a));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/automations/${id}`, { method: "DELETE" });
    if (res.ok) { setAutomations((p) => p.filter((a) => a.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Automations</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Trigger actions automatically based on events</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Automation
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Create Automation</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Automation Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Welcome new contacts" style={iStyle} /></div>
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Trigger (When…)</Label>
                <select value={form.triggerId} onChange={(e) => setForm((p) => ({ ...p, triggerId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                  {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Action (Then…)</Label>
                <select value={form.actionId} onChange={(e) => setForm((p) => ({ ...p, actionId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                  {ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>{creating ? "Creating…" : "Create Automation"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Automation</span><span>Trigger</span><span>Runs</span><span>Last Run</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : automations.length === 0 ? (
          <div className="py-12 text-center"><Zap size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No automations yet</p><p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create rules to automate your workflows</p></div>
        ) : automations.map((a) => (
          <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.active ? "#6366F118" : "var(--obs-elevated)" }}>
                <Zap size={13} style={{ color: a.active ? "var(--obs-accent)" : "var(--obs-muted)" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{a.name}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{(a.actions as Array<{label: string}>)[0]?.label}</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{(a.trigger as {label: string}).label}</p>
            <p className="text-sm" style={{ color: "var(--obs-text)" }}>{a.runCount.toLocaleString()}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{a.lastRunAt ? new Date(a.lastRunAt).toLocaleDateString() : "Never"}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => handleToggle(a.id, a.active)} className="p-1.5 rounded-lg hover:bg-white/5">
                {a.active ? <Pause size={13} style={{ color: "var(--obs-success)" }} /> : <Play size={13} style={{ color: "var(--obs-muted)" }} />}
              </button>
              <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                <Trash2 size={13} style={{ color: "var(--obs-danger)" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
