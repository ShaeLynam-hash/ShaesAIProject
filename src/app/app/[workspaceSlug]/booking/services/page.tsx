"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
  active: boolean;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#22C55E", "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6"];

export default function ServicesPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", duration: 30, price: 0, color: "#6366F1" });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/booking/services?workspace=${workspaceSlug}`);
    const data = await res.json();
    setServices(data.services ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [workspaceSlug]);

  async function createService() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/booking/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ name: "", description: "", duration: 30, price: 0, color: "#6366F1" });
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/booking/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/booking/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Services</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Bookable services offered to clients</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--obs-accent)" }}>
          <Plus size={14} /> Add Service
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Loading...</p>
      ) : services.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No services yet. Add your first service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {services.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="w-3 h-10 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{s.name}</p>
                {s.description && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--obs-muted)" }}>{s.description}</p>}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-muted)" }}>
                  <Clock size={12} />{s.duration} min
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-muted)" }}>
                  <DollarSign size={12} />{s.price.toFixed(2)}
                </div>
                <button onClick={() => toggleActive(s.id, s.active)} title={s.active ? "Deactivate" : "Activate"}>
                  {s.active
                    ? <ToggleRight size={20} style={{ color: "var(--obs-success)" }} />
                    : <ToggleLeft size={20} style={{ color: "var(--obs-muted)" }} />}
                </button>
                <button onClick={() => deleteService(s.id)} className="p-1 rounded hover:opacity-80">
                  <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>New Service</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                  placeholder="e.g. Haircut" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}
                  placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Duration</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Price ($)</label>
                  <input type="number" min={0} step={0.01} value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ background: c, borderColor: form.color === c ? "var(--obs-text)" : "transparent" }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                Cancel
              </button>
              <button onClick={createService} disabled={saving || !form.name}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {saving ? "Saving..." : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
