import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarCheck, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "var(--obs-accent)",
  CONFIRMED: "var(--obs-success)",
  CANCELLED: "var(--obs-danger)",
  COMPLETED: "var(--obs-muted)",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

export default async function BookingPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000);
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000);

  const [todayCount, weekCount, pendingCount, completedCount, upcoming] = await Promise.all([
    prisma.appointment.count({ where: { workspaceId: workspace.id, date: { gte: todayStart, lt: todayEnd } } }),
    prisma.appointment.count({ where: { workspaceId: workspace.id, date: { gte: todayStart, lt: weekEnd } } }),
    prisma.appointment.count({ where: { workspaceId: workspace.id, status: "PENDING" } }),
    prisma.appointment.count({ where: { workspaceId: workspace.id, status: "COMPLETED" } }),
    prisma.appointment.findMany({
      where: { workspaceId: workspace.id, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { service: true },
    }),
  ]);

  const stats = [
    { label: "Today",      value: todayCount,     icon: CalendarCheck, color: "var(--obs-accent)"  },
    { label: "This Week",  value: weekCount,       icon: Clock,         color: "#F59E0B"             },
    { label: "Pending",    value: pendingCount,    icon: AlertCircle,   color: "var(--obs-danger)"  },
    { label: "Completed",  value: completedCount,  icon: CheckCircle,   color: "var(--obs-success)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Booking</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Manage services, appointments, and your public booking page</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--obs-muted)" }}>No upcoming appointments</p>
        ) : (
          <div className="space-y-0">
            {upcoming.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--obs-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: appt.service.color }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{appt.clientName}</p>
                    <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{appt.service.name} · {fmtDate(appt.date)}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${STATUS_COLORS[appt.status]}18`, color: STATUS_COLORS[appt.status] }}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
