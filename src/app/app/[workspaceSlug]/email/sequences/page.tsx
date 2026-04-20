"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Play, Pause, ArrowDown, Users, Mail, ChevronRight, X, Clock, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Step { id: string; stepNumber: number; delayDays: number; subject: string; body: string; fromName: string | null; fromEmail: string | null }
interface Sequence { id: string; name: string; description: string | null; trigger: string; active: boolean; createdAt: string; steps: Step[]; _count: { enrollments: number } }

const TRIGGERS = [
  { id: "manual",               label: "Manual — enroll contacts yourself" },
  { id: "contact.created",      label: "When a new contact is added"        },
  { id: "deal.stage_changed",   label: "When a deal stage changes"           },
  { id: "tag.added",            label: "When a tag is applied"               },
];

export default function SequencesPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sequence | null>(null);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "", trigger: "manual" });

  // Step builder
  const [addingStep, setAddingStep] = useState(false);
  const [stepForm, setStepForm] = useState({ subject: "", body: "", delayDays: "1", fromName: "", fromEmail: "" });
  const [showStepForm, setShowStepForm] = useState(false);

  // Enroll
  const [enrollingCount, setEnrollingCount] = useState<number | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchSequences = useCallback(async () => {
    const res = await fetch(`/api/sequences?workspace=${workspaceSlug}`);
    if (res.ok) {
      const { sequences: s } = await res.json();
      setSequences(s);
      if (selected) setSelected(s.find((x: Sequence) => x.id === selected.id) ?? null);
    }
    setLoading(false);
  }, [workspaceSlug, selected]);

  useEffect(() => { fetchSequences(); }, [workspaceSlug]);

  const handleCreate = async () => {
    if (!newForm.name.trim()) { toast.error("Name required"); return; }
    setCreating(true);
    const res = await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...newForm }),
    });
    if (res.ok) {
      const { sequence } = await res.json();
      setSequences((p) => [sequence, ...p]);
      setSelected(sequence);
      setShowNew(false);
      setNewForm({ name: "", description: "", trigger: "manual" });
      toast.success("Sequence created");
    } else toast.error("Failed to create");
    setCreating(false);
  };

  const handleAddStep = async () => {
    if (!stepForm.subject.trim() || !stepForm.body.trim()) { toast.error("Subject and body required"); return; }
    if (!selected) return;
    setAddingStep(true);
    const res = await fetch(`/api/sequences/${selected.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...stepForm, delayDays: parseInt(stepForm.delayDays) || 0 }),
    });
    if (res.ok) {
      toast.success("Step added");
      setStepForm({ subject: "", body: "", delayDays: "1", fromName: "", fromEmail: "" });
      setShowStepForm(false);
      fetchSequences();
    } else toast.error("Failed to add step");
    setAddingStep(false);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!selected) return;
    const res = await fetch(`/api/sequences/${selected.id}/steps`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId }),
    });
    if (res.ok) { toast.success("Step removed"); fetchSequences(); }
    else toast.error("Failed");
  };

  const handleToggle = async (seq: Sequence) => {
    const res = await fetch(`/api/sequences/${seq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !seq.active }),
    });
    if (res.ok) { setSequences((p) => p.map((s) => s.id === seq.id ? { ...s, active: !seq.active } : s)); if (selected?.id === seq.id) setSelected((p) => p ? { ...p, active: !p.active } : p); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    if (res.ok) { setSequences((p) => p.filter((s) => s.id !== id)); if (selected?.id === id) setSelected(null); toast.success("Deleted"); }
  };

  const handleEnrollAll = async () => {
    if (!selected) return;
    const contactsRes = await fetch(`/api/crm/contacts?workspace=${workspaceSlug}`);
    if (!contactsRes.ok) { toast.error("Failed to fetch contacts"); return; }
    const { contacts } = await contactsRes.json();
    const withEmail = contacts.filter((c: { email: string | null }) => c.email);
    if (withEmail.length === 0) { toast.error("No contacts with email addresses"); return; }
    setEnrollingCount(withEmail.length);
    const res = await fetch(`/api/sequences/${selected.id}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, contactIds: withEmail.map((c: { id: string }) => c.id) }),
    });
    if (res.ok) {
      const { enrolled, skipped } = await res.json();
      toast.success(`Enrolled ${enrolled} contacts${skipped > 0 ? ` (${skipped} already enrolled)` : ""}`);
      fetchSequences();
    } else toast.error("Failed to enroll");
    setEnrollingCount(null);
  };

  const handleProcessNow = async () => {
    setSendingTest(true);
    const res = await fetch("/api/sequences/process");
    if (res.ok) { const d = await res.json(); toast.success(`Processed: ${d.sent} sent, ${d.failed} failed`); }
    else toast.error("Processing failed");
    setSendingTest(false);
  };

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Email Sequences</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Automated multi-step email drip campaigns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleProcessNow} disabled={sendingTest}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border disabled:opacity-50"
            style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
            <Send size={12} /> {sendingTest ? "Processing…" : "Process Now"}
          </button>
          <button onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Sequence
          </button>
        </div>
      </div>

      {/* New sequence form */}
      {showNew && (
        <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-accent)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>New Sequence</h3>
            <button onClick={() => setShowNew(false)}><X size={14} style={{ color: "var(--obs-muted)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Name *</Label>
              <Input value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} placeholder="Welcome Series" style={iStyle} />
            </div>
            <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Trigger</Label>
              <select value={newForm.trigger} onChange={(e) => setNewForm((p) => ({ ...p, trigger: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <Input value={newForm.description} onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" style={iStyle} />
          <button onClick={handleCreate} disabled={creating}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
            {creating ? "Creating…" : "Create Sequence"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-[280px_1fr] gap-5">
        {/* Left: sequence list */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          {loading ? <div className="py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
          : sequences.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Mail size={24} className="mx-auto" style={{ color: "var(--obs-muted)" }} />
              <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No sequences yet</p>
            </div>
          ) : sequences.map((seq) => (
            <div key={seq.id}
              onClick={() => setSelected(seq)}
              className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:bg-white/[0.02]"
              style={{ borderColor: "var(--obs-border)", background: selected?.id === seq.id ? "rgba(245,158,11,0.06)" : undefined }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{seq.name}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{seq.steps.length} steps · {seq._count.enrollments} enrolled</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: seq.active ? "#22C55E18" : "var(--obs-elevated)", color: seq.active ? "#22C55E" : "var(--obs-muted)" }}>
                  {seq.active ? "ON" : "OFF"}
                </span>
                <ChevronRight size={12} style={{ color: "var(--obs-muted)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Right: sequence detail */}
        {selected ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-xl border p-5" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--obs-text)" }}>{selected.name}</h3>
                  {selected.description && <p className="text-sm mt-1" style={{ color: "var(--obs-muted)" }}>{selected.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Trigger: <span style={{ color: "var(--obs-text)" }}>{TRIGGERS.find((t) => t.id === selected.trigger)?.label}</span></span>
                    <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{selected._count.enrollments} enrolled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleEnrollAll} disabled={enrollingCount !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: "#6366F1" }}>
                    <Users size={11} /> {enrollingCount !== null ? `Enrolling ${enrollingCount}…` : "Enroll All Contacts"}
                  </button>
                  <button onClick={() => handleToggle(selected)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                    {selected.active ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Activate</>}
                  </button>
                  <button onClick={() => handleDelete(selected.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {selected.steps.length === 0 && (
                <div className="py-8 text-center rounded-xl border-2 border-dashed" style={{ borderColor: "var(--obs-border)" }}>
                  <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No steps yet — add your first email below</p>
                </div>
              )}
              {selected.steps.map((step, i) => (
                <div key={step.id}>
                  {i > 0 && (
                    <div className="flex items-center gap-2 py-1 pl-4">
                      <ArrowDown size={13} style={{ color: "var(--obs-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>
                        <Clock size={10} className="inline mr-1" />Wait {step.delayDays} day{step.delayDays !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  <div className="p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--obs-accent)18", color: "var(--obs-accent)" }}>Step {step.stepNumber}</span>
                          {i === 0 && <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Sends immediately on enrollment</span>}
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{step.subject}</p>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--obs-muted)" }}>{step.body}</p>
                        {step.fromEmail && <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>From: {step.fromName} &lt;{step.fromEmail}&gt;</p>}
                      </div>
                      <button onClick={() => handleDeleteStep(step.id)} className="p-1.5 rounded hover:bg-red-500/10 shrink-0">
                        <X size={12} style={{ color: "var(--obs-danger)" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add step */}
            {!showStepForm ? (
              <button onClick={() => setShowStepForm(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2"
                style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                <Plus size={14} /> Add Email Step
              </button>
            ) : (
              <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-accent)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Add Step {selected.steps.length + 1}</p>
                  <button onClick={() => setShowStepForm(false)}><X size={14} style={{ color: "var(--obs-muted)" }} /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Subject *</Label>
                    <Input value={stepForm.subject} onChange={(e) => setStepForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Hi {{first_name}}, quick check-in…" style={iStyle} />
                  </div>
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Delay (days)</Label>
                    <Input type="number" min="0" value={stepForm.delayDays} onChange={(e) => setStepForm((p) => ({ ...p, delayDays: e.target.value }))} style={iStyle} />
                  </div>
                </div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Body *</Label>
                  <textarea value={stepForm.body} onChange={(e) => setStepForm((p) => ({ ...p, body: e.target.value }))}
                    placeholder={"Hi {{first_name}},\n\nJust wanted to follow up…"}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" rows={5} style={iStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={stepForm.fromName} onChange={(e) => setStepForm((p) => ({ ...p, fromName: e.target.value }))} placeholder="From name (optional)" style={iStyle} />
                  <Input type="email" value={stepForm.fromEmail} onChange={(e) => setStepForm((p) => ({ ...p, fromEmail: e.target.value }))} placeholder="from@yourdomain.com (optional)" style={iStyle} />
                </div>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"} as placeholders</p>
                <div className="flex gap-2">
                  <button onClick={handleAddStep} disabled={addingStep}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
                    {addingStep ? "Adding…" : "Add Step"}
                  </button>
                  <button onClick={() => setShowStepForm(false)}
                    className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed" style={{ borderColor: "var(--obs-border)", minHeight: 300 }}>
            <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Select a sequence to edit it</p>
          </div>
        )}
      </div>
    </div>
  );
}
