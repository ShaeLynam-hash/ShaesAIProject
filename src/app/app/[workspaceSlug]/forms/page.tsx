"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Code2, GripVertical, X } from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  options?: string; // comma-separated for select
  required: boolean;
}

interface Form {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  _count: { submissions: number };
}

const FIELD_TYPES = [
  { value: "text",     label: "Short Text"  },
  { value: "email",    label: "Email"       },
  { value: "phone",    label: "Phone"       },
  { value: "textarea", label: "Long Text"   },
  { value: "select",   label: "Dropdown"    },
  { value: "checkbox", label: "Checkbox"    },
];

function newField(): FormField {
  return { id: Math.random().toString(36).slice(2), type: "text", label: "", required: false };
}

export default function FormsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<FormField[]>([newField()]);
  const [embedId, setEmbedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/forms?workspace=${workspaceSlug}`);
    const data = await res.json();
    setForms(data.forms ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [workspaceSlug]);

  async function createForm() {
    if (!formName || fields.length === 0) return;
    setSaving(true);
    await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, name: formName, fields }),
    });
    setSaving(false);
    setOpen(false);
    setFormName("");
    setFields([newField()]);
    load();
  }

  async function deleteForm(id: string) {
    if (!confirm("Delete this form and all submissions?")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    load();
  }

  function addField() { setFields(f => [...f, newField()]); }
  function removeField(id: string) { setFields(f => f.filter(x => x.id !== id)); }
  function updateField(id: string, patch: Partial<FormField>) {
    setFields(f => f.map(x => x.id === id ? { ...x, ...patch } : x));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Forms</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Build and embed custom forms</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--obs-accent)" }}>
          <Plus size={14} /> New Form
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Loading...</p>
      ) : forms.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No forms yet. Create your first form.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(f => (
            <div key={f.id} className="p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{f.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{f._count.submissions} submission{f._count.submissions !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/forms/${f.id}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                    <ExternalLink size={11} /> Open
                  </a>
                  <button onClick={() => setEmbedId(embedId === f.id ? null : f.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                    <Code2 size={11} /> Embed
                  </button>
                  <button onClick={() => deleteForm(f.id)} className="p-1.5 rounded hover:opacity-80">
                    <Trash2 size={13} style={{ color: "var(--obs-danger)" }} />
                  </button>
                </div>
              </div>
              {embedId === f.id && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--obs-elevated)" }}>
                  <p className="text-xs mb-1 font-medium" style={{ color: "var(--obs-muted)" }}>Embed Code</p>
                  <code className="text-xs break-all" style={{ color: "var(--obs-accent-2)" }}>
                    {`<iframe src="${origin}/forms/${f.id}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`}
                  </code>
                  <p className="text-xs mt-2 font-medium" style={{ color: "var(--obs-muted)" }}>Public Link</p>
                  <code className="text-xs break-all" style={{ color: "var(--obs-accent-2)" }}>
                    {`${origin}/forms/${f.id}`}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>New Form</h3>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Form Name *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                placeholder="e.g. Contact Form" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--obs-muted)" }}>Fields</label>
                <button onClick={addField} className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-accent)" }}>
                  <Plus size={11} /> Add Field
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="p-3 rounded-lg border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical size={13} style={{ color: "var(--obs-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Field {idx + 1}</span>
                      <div className="flex-1" />
                      <button onClick={() => removeField(field.id)} disabled={fields.length === 1}>
                        <X size={12} style={{ color: "var(--obs-muted)" }} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] mb-0.5 block" style={{ color: "var(--obs-muted)" }}>Label</label>
                        <input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })}
                          className="w-full px-2 py-1.5 rounded border text-xs outline-none"
                          style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                          placeholder="Field label" />
                      </div>
                      <div>
                        <label className="text-[10px] mb-0.5 block" style={{ color: "var(--obs-muted)" }}>Type</label>
                        <select value={field.type} onChange={e => updateField(field.id, { type: e.target.value as FormField["type"] })}
                          className="w-full px-2 py-1.5 rounded border text-xs outline-none"
                          style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
                          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {field.type === "select" && (
                      <div className="mt-2">
                        <label className="text-[10px] mb-0.5 block" style={{ color: "var(--obs-muted)" }}>Options (comma-separated)</label>
                        <input value={field.options ?? ""} onChange={e => updateField(field.id, { options: e.target.value })}
                          className="w-full px-2 py-1.5 rounded border text-xs outline-none"
                          style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                          placeholder="Option 1, Option 2, Option 3" />
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <input type="checkbox" id={`req-${field.id}`} checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })} />
                      <label htmlFor={`req-${field.id}`} className="text-xs" style={{ color: "var(--obs-muted)" }}>Required</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                Cancel
              </button>
              <button onClick={createForm} disabled={saving || !formName}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {saving ? "Saving..." : "Create Form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
