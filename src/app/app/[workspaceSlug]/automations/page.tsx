"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Zap, Trash2, Play, Pause, ArrowDown, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Automation {
  id: string; name: string; trigger: { type: string; label: string }; actions: { type: string; label: string; config?: Record<string, string> }[];
  active: boolean; runCount: number; lastRunAt: string | null; createdAt: string;
}

const TRIGGERS = [
  { id: "contact.created",    label: "New Contact Created",       icon: "👤" },
  { id: "deal.stage_changed", label: "Deal Stage Changed",         icon: "📋" },
  { id: "invoice.paid",       label: "Invoice Paid",               icon: "💳" },
  { id: "invoice.overdue",    label: "Invoice Overdue",            icon: "⚠️" },
  { id: "form.submitted",     label: "Form Submitted",             icon: "📝" },
  { id: "appointment.booked", label: "Appointment Booked",         icon: "📅" },
  { id: "schedule.daily",     label: "Daily Schedule",             icon: "⏰" },
  { id: "schedule.weekly",    label: "Weekly Schedule",            icon: "📆" },
];

const ACTIONS = [
  { id: "email.send",          label: "Send Email",                icon: "✉️",  fields: ["subject", "body"] },
  { id: "sms.send",            label: "Send SMS",                  icon: "💬",  fields: ["message"] },
  { id: "contact.tag",         label: "Tag Contact",               icon: "🏷️",  fields: ["tag"] },
  { id: "contact.update_status", label: "Update Contact Status",   icon: "🔄",  fields: ["status"] },
  { id: "deal.update_stage",   label: "Update Deal Stage",         icon: "📊",  fields: ["stage"] },
  { id: "deal.create",         label: "Create Deal",               icon: "💼",  fields: ["title", "value"] },
  { id: "ai.summarize",        label: "AI: Summarize",             icon: "🤖",  fields: [] },
  { id: "webhook.call",        label: "Call Webhook",              icon: "🔗",  fields: ["url"] },
  { id: "notification.send",   label: "Send Notification",         icon: "🔔",  fields: ["message"] },
  { id: "wait.delay",          label: "Wait / Delay",              icon: "⏳",  fields: ["hours"] },
];

function ActionCard({ action, index, onRemove }: {
  action: { type: string; label: string; config?: Record<string, string> };
  index: number;
  onRemove: () => void;
}) {
  const def = ACTIONS.find((a) => a.id === action.type);
  return (
    <div className="relative">
      {index > 0 && (
        <div className="flex justify-center mb-1">
          <ArrowDown size={14} style={{ color: "var(--obs-muted)" }} />
        </div>
      )}
      <div className="p-3 rounded-xl border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{def?.icon ?? "⚡"}</span>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{action.label}</p>
            {action.config && Object.entries(action.config).map(([k, v]) => v && (
              <p key={k} className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{k}: {v}</p>
            ))}
          </div>
          <button onClick={onRemove} className="p-1 rounded hover:bg-red-500/10">
            <X size={12} style={{ color: "var(--obs-danger)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const [builderName, setBuilderName] = useState("");
  const [builderTrigger, setBuilderTrigger] = useState("contact.created");
  const [builderActions, setBuilderActions] = useState<{ type: string; label: string; config: Record<string, string> }[]>([]);
  const [nextActionType, setNextActionType] = useState("email.send");

  const fetchAutomations = useCallback(async () => {
    const res = await fetch(`/api/automations?workspace=${workspaceSlug}`);
    if (res.ok) setAutomations((await res.json()).automations);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const addAction = () => {
    const def = ACTIONS.find((a) => a.id === nextActionType)!;
    setBuilderActions((p) => [...p, { type: def.id, label: def.label, config: {} }]);
  };

  const removeAction = (i: number) => setBuilderActions((p) => p.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!builderName.trim()) { toast.error("Name required"); return; }
    if (builderActions.length === 0) { toast.error("Add at least one action"); return; }
    setCreating(true);
    const trigger = TRIGGERS.find((t) => t.id === builderTrigger)!;
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, name: builderName, trigger: { type: trigger.id, label: trigger.label }, actions: builderActions }),
    });
    if (res.ok) {
      const { automation } = await res.json();
      setAutomations((p) => [automation, ...p]);
      setBuilderName(""); setBuilderTrigger("contact.created"); setBuilderActions([]);
      setShowBuilder(false);
      toast.success("Automation created");
    } else toast.error("Failed to create");
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
  const trigger = TRIGGERS.find((t) => t.id === builderTrigger);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Automations</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Trigger multi-step workflows automatically</p>
        </div>
        <button onClick={() => setShowBuilder(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--obs-accent)" }}>
          <Plus size={15} /> New Automation
        </button>
      </div>

      {/* Builder panel */}
      {showBuilder && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-accent)", boxShadow: "0 0 0 2px var(--obs-accent)20" }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Build Automation</h3>
            <button onClick={() => setShowBuilder(false)}><X size={15} style={{ color: "var(--obs-muted)" }} /></button>
          </div>
          <div className="p-5 grid grid-cols-[1fr_280px] gap-6">
            {/* Flow builder */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Automation Name *</Label>
                <Input value={builderName} onChange={(e) => setBuilderName(e.target.value)} placeholder="Welcome new contacts" style={iStyle} />
              </div>

              {/* Trigger node */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--obs-muted)" }}>Trigger — When this happens</p>
                <div className="p-4 rounded-xl border-2" style={{ borderColor: "var(--obs-accent)", background: "var(--obs-accent)08" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{trigger?.icon}</span>
                    <select value={builderTrigger} onChange={(e) => setBuilderTrigger(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium outline-none" style={iStyle}>
                      {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--obs-muted)" }}>Actions — Then do this</p>
                {builderActions.length === 0 ? (
                  <div className="py-6 text-center rounded-xl border-2 border-dashed" style={{ borderColor: "var(--obs-border)" }}>
                    <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No actions yet — add one below</p>
                  </div>
                ) : builderActions.map((action, i) => (
                  <ActionCard key={i} action={action} index={i} onRemove={() => removeAction(i)} />
                ))}
              </div>

              {/* Add action */}
              <div className="flex gap-2">
                <select value={nextActionType} onChange={(e) => setNextActionType(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                  {ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
                </select>
                <button onClick={addAction}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#6366F1" }}>
                  <Plus size={13} /> Add Step
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>Flow Preview</p>
              <div className="rounded-xl border p-4 space-y-1" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", minHeight: 200 }}>
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--obs-accent)15" }}>
                  <Zap size={12} style={{ color: "var(--obs-accent)" }} />
                  <span className="text-xs font-medium truncate" style={{ color: "var(--obs-text)" }}>{trigger?.label}</span>
                </div>
                {builderActions.map((a, i) => {
                  const def = ACTIONS.find((x) => x.id === a.type);
                  return (
                    <div key={i}>
                      <div className="flex justify-center"><ArrowDown size={10} style={{ color: "var(--obs-muted)" }} /></div>
                      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--obs-surface)" }}>
                        <span className="text-xs">{def?.icon}</span>
                        <span className="text-xs truncate" style={{ color: "var(--obs-text)" }}>{a.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleCreate} disabled={creating || !builderName.trim() || builderActions.length === 0}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Activate Automation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automations list */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Automation</span><span>Trigger</span><span>Runs</span><span>Last Run</span><span />
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : automations.length === 0 ? (
          <div className="py-12 text-center">
            <Zap size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No automations yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Create rules to automate your workflows</p>
          </div>
        ) : automations.map((a) => (
          <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.active ? "#6366F118" : "var(--obs-elevated)" }}>
                <Zap size={13} style={{ color: a.active ? "var(--obs-accent)" : "var(--obs-muted)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{a.name}</p>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {(a.actions as Array<{ label: string }>).map((act, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <ChevronRight size={8} style={{ color: "var(--obs-muted)" }} />}
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{act.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{(a.trigger as { label: string }).label}</p>
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
