import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, Activity, Users, MousePointer } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function AnalyticsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalEvents, recentEvents, topEvents] = await Promise.all([
    prisma.analyticsEvent.count({ where: { workspaceId: workspace.id } }),
    prisma.analyticsEvent.count({ where: { workspaceId: workspace.id, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.analyticsEvent.groupBy({ by: ["event"], where: { workspaceId: workspace.id }, _count: true, orderBy: { _count: { event: "desc" } }, take: 10 }),
  ]);

  const uniqueSessions = await prisma.analyticsEvent.findMany({
    where: { workspaceId: workspace.id, createdAt: { gte: thirtyDaysAgo } },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });

  const sdkSnippet = `// Install
npm install @obsidian/analytics

// Initialize
import { Analytics } from '@obsidian/analytics';
const analytics = new Analytics('${workspaceSlug}');

// Track events
analytics.track('button_clicked', { button: 'signup' });
analytics.identify('user_123', { name: 'Jane', plan: 'pro' });
analytics.page('/dashboard');`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Analytics</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Event tracking, user behavior, and product insights</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Events",    value: totalEvents.toLocaleString(),           icon: Activity,      color: "var(--obs-accent)"  },
          { label: "Events (30d)",    value: recentEvents.toLocaleString(),          icon: BarChart3,     color: "#F59E0B"             },
          { label: "Sessions (30d)",  value: uniqueSessions.length.toLocaleString(), icon: Users,         color: "var(--obs-success)" },
          { label: "Event Types",     value: topEvents.length.toString(),            icon: MousePointer,  color: "#EC4899"             },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}18` }}><Icon size={15} style={{ color }} /></div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>Top Events</h3>
          {topEvents.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--obs-muted)" }}>No events tracked yet</p>
          ) : (
            <div className="space-y-3">
              {topEvents.map(({ event, _count }) => {
                const pct = totalEvents > 0 ? (_count / totalEvents) * 100 : 0;
                return (
                  <div key={event}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono" style={{ color: "var(--obs-text)" }}>{event}</span>
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{_count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--obs-accent)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--obs-text)" }}>SDK Integration</h3>
          <p className="text-xs mb-3" style={{ color: "var(--obs-muted)" }}>Add tracking to your app in minutes</p>
          <pre className="text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed font-mono"
            style={{ background: "var(--obs-elevated)", color: "var(--obs-text)" }}>
            {sdkSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
