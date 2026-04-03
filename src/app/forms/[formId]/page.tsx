"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, CheckCircle } from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  options?: string;
  required: boolean;
}

interface FormData {
  id: string;
  name: string;
  fields: FormField[];
  active: boolean;
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then(r => r.json())
      .then(d => { setForm(d.form); setLoading(false); });
  }, [formId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/forms/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      const d = await res.json();
      setError(d.error ?? "Something went wrong");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--obs-bg)" }}>
        <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--obs-bg)" }}>
        <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Form not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "var(--obs-bg)" }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--obs-accent)" }}>
            <FileText size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>{form.name}</h1>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--obs-success)18" }}>
                <CheckCircle size={24} style={{ color: "var(--obs-success)" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--obs-text)" }}>Submitted!</h2>
              <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Your response has been recorded. Thank you!</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {(form.fields as FormField[]).map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>
                    {field.label}{field.required && <span style={{ color: "var(--obs-danger)" }}> *</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder}
                      value={(values[field.id] as string) ?? ""}
                      onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                      style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={(values[field.id] as string) ?? ""}
                      onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
                      <option value="">Select...</option>
                      {(field.options ?? "").split(",").map(o => o.trim()).filter(Boolean).map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={field.id}
                        required={field.required}
                        checked={(values[field.id] as boolean) ?? false}
                        onChange={e => setValues(v => ({ ...v, [field.id]: e.target.checked }))}
                      />
                      <label htmlFor={field.id} className="text-sm" style={{ color: "var(--obs-text)" }}>{field.label}</label>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={(values[field.id] as string) ?? ""}
                      onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                    />
                  )}
                </div>
              ))}
              {error && <p className="text-xs" style={{ color: "var(--obs-danger)" }}>{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 mt-2"
                style={{ background: "var(--obs-accent)" }}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
