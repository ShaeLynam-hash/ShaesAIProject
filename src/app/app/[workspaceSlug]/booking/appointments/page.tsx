"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  date: string;
  status: string;
  notes: string | null;
  service: { id: string; name: string; color: string; duration: number };
}

interface Service {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "var(--obs-accent)",
  CONFIRMED: "var(--obs-success)",
  CANCELLED: "var(--obs-danger)",
  COMPLETED: "var(--obs-muted)",
};

const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d));
}

export default function AppointmentsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ serviceId: "", clientName: "", clientEmail: "", clientPhone: "", date: "", notes: "" });

  async function load() {
    setLoading(true);
    const statusParam = filter !== "ALL" ? `&status=${filter}` : "";
    const [apptRes, svcRes] = await Promise.all([
      fetch(`/api/booking/appointments?workspace=${workspaceSlug}${statusParam}`),
      fetch(`/api/booking/services?workspace=${workspaceSlug}`),
    ]);
    const [apptData, svcData] = await Promise.all([apptRes.json(), svcRes.json()]);
    setAppointments(apptData.appointments ?? []);
    setServices(svcData.services ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [workspaceSlug, filter]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/booking/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function createAppointment() {
    if (!form.serviceId || !form.clientName || !form.clientEmail || !form.date) return;
    setSaving(true);
    await fetch("/api/booking/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ serviceId: "", clientName: "", clientEmail: "", clientPhone: "", date: "", notes: "" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Appointments</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>All client appointments</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--obs-accent)" }}>
          <Plus size={14} /> New Appointment
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              background: filter === s ? "var(--obs-accent)" : "var(--obs-surface)",
              borderColor: filter === s ? "var(--obs-accent)" : "var(--obs-border)",
              color: filter === s ? "#fff" : "var(--obs-muted)",
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--obs-border)" }}>
              {["Client", "Service", "Date & Time", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--obs-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No appointments found</td></tr>
            ) : appointments.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--obs-border)" }}>
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: "var(--obs-text)" }}>{a.clientName}</p>
                  <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{a.clientEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.service.color }} />
                    <span style={{ color: "var(--obs-text)" }}>{a.service.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--obs-muted)" }}>{fmtDate(a.date)}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status] }}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {a.status === "PENDING" && (
                      <button onClick={() => updateStatus(a.id, "CONFIRMED")} title="Confirm"
                        className="p-1 rounded hover:opacity-80">
                        <CheckCircle size={15} style={{ color: "var(--obs-success)" }} />
                      </button>
                    )}
                    {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                      <button onClick={() => updateStatus(a.id, "CANCELLED")} title="Cancel"
                        className="p-1 rounded hover:opacity-80">
                        <XCircle size={15} style={{ color: "var(--obs-danger)" }} />
                      </button>
                    )}
                    {a.status === "CONFIRMED" && (
                      <button onClick={() => updateStatus(a.id, "COMPLETED")} title="Mark Completed"
                        className="px-2 py-0.5 rounded text-xs border"
                        style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                        Done
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>New Appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Service *</label>
                <select value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
                  <option value="">Select service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {[
                { key: "clientName", label: "Client Name *", type: "text", placeholder: "John Doe" },
                { key: "clientEmail", label: "Client Email *", type: "email", placeholder: "john@example.com" },
                { key: "clientPhone", label: "Phone", type: "tel", placeholder: "+1 555-0000" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Date & Time *</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                Cancel
              </button>
              <button onClick={createAppointment} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
