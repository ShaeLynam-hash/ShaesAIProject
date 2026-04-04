"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Calendar, Receipt, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

interface Appointment {
  id: string;
  date: string;
  status: string;
  service: { name: string };
  notes?: string;
}

interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

interface ClientData {
  client: { name: string; email: string };
  appointments: Appointment[];
  invoices: Invoice[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusIcon = {
  CONFIRMED: <CheckCircle2 size={13} style={{ color: "#16a34a" }} />,
  PENDING: <Clock size={13} style={{ color: "#F59E0B" }} />,
  CANCELLED: <XCircle size={13} style={{ color: "#ef4444" }} />,
  COMPLETED: <CheckCircle2 size={13} style={{ color: "#6366f1" }} />,
};

const invoiceColor: Record<string, string> = {
  PAID: "#16a34a", SENT: "#F59E0B", OVERDUE: "#ef4444", DRAFT: "#6b7280",
};

export default function ClientDashboard({ params }: Props) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/${workspaceSlug}/me`)
      .then((r) => { if (r.status === 401) { router.push(`/portal/${workspaceSlug}`); return null; } return r.json(); })
      .then((d) => { if (d) setData(d); setLoading(false); });
  }, [workspaceSlug, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--obs-bg)" }}>
      <div className="text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "var(--obs-bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>
              Welcome back, {data.client.name.split(" ")[0]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{data.client.email}</p>
          </div>
          <button onClick={() => { document.cookie = "portal_token=; max-age=0"; router.push(`/portal/${workspaceSlug}`); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium"
            style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
            Sign out
          </button>
        </div>

        {/* Appointments */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--obs-border)" }}>
            <Calendar size={15} style={{ color: "var(--obs-accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Your Appointments</h2>
          </div>
          {data.appointments.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No appointments yet</div>
          ) : data.appointments.map((apt) => (
            <div key={apt.id} className="px-5 py-4 border-b last:border-0 flex items-center justify-between"
              style={{ borderColor: "var(--obs-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{apt.service.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{fmtDate(apt.date)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--obs-muted)" }}>
                {statusIcon[apt.status as keyof typeof statusIcon]}
                {apt.status}
              </div>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--obs-border)" }}>
            <Receipt size={15} style={{ color: "var(--obs-accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Your Invoices</h2>
          </div>
          {data.invoices.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No invoices yet</div>
          ) : data.invoices.map((inv) => (
            <div key={inv.id} className="px-5 py-4 border-b last:border-0 flex items-center justify-between"
              style={{ borderColor: "var(--obs-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>Invoice #{inv.number}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>Due {fmtDate(inv.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{fmt(inv.total)}</p>
                <span className="text-xs font-semibold" style={{ color: invoiceColor[inv.status] ?? "var(--obs-muted)" }}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
