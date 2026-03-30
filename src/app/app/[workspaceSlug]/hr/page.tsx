"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, UserCheck, Trash2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Employee { id: string; firstName: string; lastName: string; email: string; phone: string | null; title: string | null; department: string | null; salary: number | null; startDate: string; status: string; }

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "Operations", "Finance", "HR", "Legal", "Customer Success", "Other"];

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n); }

export default function HrPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", title: "", department: "Engineering", salary: "", startDate: new Date().toISOString().split("T")[0] });

  const fetchEmployees = useCallback(async () => {
    const res = await fetch(`/api/hr/employees?workspace=${workspaceSlug}`);
    if (res.ok) setEmployees((await res.json()).employees);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.email.trim()) { toast.error("First name and email required"); return; }
    setCreating(true);
    const res = await fetch("/api/hr/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form, salary: form.salary ? parseFloat(form.salary) : null }) });
    if (res.ok) { const { employee } = await res.json(); setEmployees((p) => [employee, ...p]); setForm({ firstName: "", lastName: "", email: "", phone: "", title: "", department: "Engineering", salary: "", startDate: new Date().toISOString().split("T")[0] }); setOpen(false); toast.success("Employee added"); }
    else toast.error("Failed to add");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/hr/employees/${id}`, { method: "DELETE" });
    if (res.ok) { setEmployees((p) => p.filter((e) => e.id !== id)); toast.success("Removed"); }
    setDeletingId(null);
  };

  const active = employees.filter((e) => e.status === "ACTIVE");
  const totalPayroll = active.reduce((s, e) => s + (e.salary ?? 0), 0);
  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>HR & People</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{active.length} active employees · {fmt(totalPayroll / 12)}/mo payroll</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}><Plus size={15} /> Add Employee</DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Add Employee</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Jane" style={iStyle} /></div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Smith" style={iStyle} /></div>
              </div>
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" style={iStyle} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Job Title</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Software Engineer" style={iStyle} /></div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Department</Label><select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Annual Salary ($)</Label><Input type="number" value={form.salary} onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))} placeholder="80000" style={iStyle} /></div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} style={iStyle} /></div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>{creating ? "Adding…" : "Add Employee"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Department breakdown */}
      {employees.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {DEPARTMENTS.slice(0, 5).map((dept) => {
            const count = employees.filter((e) => e.department === dept && e.status === "ACTIVE").length;
            return count > 0 ? (
              <div key={dept} className="p-3 rounded-xl border text-center" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                <p className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>{count}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{dept}</p>
              </div>
            ) : null;
          })}
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Employee</span><span>Department</span><span>Salary</span><span>Start Date</span><span>Status</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : employees.length === 0 ? (
          <div className="py-12 text-center"><UserCheck size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No employees yet</p></div>
        ) : employees.map((e) => (
          <div key={e.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{e.firstName} {e.lastName}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{e.title ?? e.email}</p>
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{e.department ?? "—"}</p>
            <div className="flex items-center gap-1">
              <DollarSign size={11} style={{ color: "var(--obs-muted)" }} />
              <p className="text-sm" style={{ color: "var(--obs-text)" }}>{e.salary ? fmt(e.salary) : "—"}</p>
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{new Date(e.startDate).toLocaleDateString()}</p>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: e.status === "ACTIVE" ? "#22C55E18" : "var(--obs-elevated)", color: e.status === "ACTIVE" ? "var(--obs-success)" : "var(--obs-muted)" }}>{e.status}</span>
            <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"><Trash2 size={14} style={{ color: "var(--obs-danger)" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
