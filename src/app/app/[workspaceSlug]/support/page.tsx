import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Headphones, AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function SupportPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const [open, inProgress, resolved, total, recent] = await Promise.all([
    prisma.ticket.count({ where: { workspaceId: workspace.id, status: "OPEN" } }),
    prisma.ticket.count({ where: { workspaceId: workspace.id, status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { workspaceId: workspace.id, status: "RESOLVED" } }),
    prisma.ticket.count({ where: { workspaceId: workspace.id } }),
    prisma.ticket.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(0) : "0";
  const priorityColor: Record<string, string> = { LOW: "var(--obs-muted)", NORMAL: "#6366F1", HIGH: "#F59E0B", URGENT: "#EF4444" };
  const statusColor: Record<string, string> = { OPEN: "#F59E0B", IN_PROGRESS: "#6366F1", RESOLVED: "#22C55E", CLOSED: "var(--obs-muted)" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Support</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Helpdesk, tickets, and customer support</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open Tickets",     value: open.toString(),        icon: AlertCircle,  color: "#F59E0B"            },
          { label: "In Progress",      value: inProgress.toString(),  icon: Clock,        color: "var(--obs-accent)"  },
          { label: "Resolved",         value: resolved.toString(),    icon: CheckCircle,  color: "var(--obs-success)" },
          { label: "Resolution Rate",  value: `${resolutionRate}%`,   icon: TrendingUp,   color: "#EC4899"             },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}18` }}><Icon size={15} style={{ color }} /></div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Recent Tickets</h3>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center"><Headphones size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No tickets yet</p></div>
        ) : recent.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{t.subject}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{t.fromName ?? t.fromEmail} · {new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: `${priorityColor[t.priority] ?? "#6366F1"}18`, color: priorityColor[t.priority] ?? "#6366F1" }}>{t.priority}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: `${statusColor[t.status] ?? "#F59E0B"}18`, color: statusColor[t.status] ?? "#F59E0B" }}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
