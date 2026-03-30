import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Send, Mail, MousePointer, TrendingUp } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function EmailPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const [total, sent, totals] = await Promise.all([
    prisma.emailCampaign.count({ where: { workspaceId: workspace.id } }),
    prisma.emailCampaign.count({ where: { workspaceId: workspace.id, status: "SENT" } }),
    prisma.emailCampaign.aggregate({ where: { workspaceId: workspace.id }, _sum: { recipientCount: true, openCount: true, clickCount: true } }),
  ]);

  const recipients = totals._sum.recipientCount ?? 0;
  const opens = totals._sum.openCount ?? 0;
  const clicks = totals._sum.clickCount ?? 0;
  const openRate = recipients > 0 ? ((opens / recipients) * 100).toFixed(1) : "0.0";
  const clickRate = recipients > 0 ? ((clicks / recipients) * 100).toFixed(1) : "0.0";

  const recent = await prisma.emailCampaign.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 5 });
  const statusColor: Record<string, string> = { DRAFT: "var(--obs-muted)", SENT: "var(--obs-success)", SCHEDULED: "#F59E0B" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Email</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Campaigns, broadcasts, and transactional emails</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Campaigns Sent", value: sent.toString(), icon: Send,          color: "var(--obs-accent)"  },
          { label: "Total Sent",     value: recipients.toLocaleString(), icon: Mail, color: "#6366F1"         },
          { label: "Open Rate",      value: `${openRate}%`, icon: TrendingUp,     color: "var(--obs-success)" },
          { label: "Click Rate",     value: `${clickRate}%`, icon: MousePointer,  color: "#F59E0B"             },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Recent Campaigns</h3>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Campaign</span><span>Status</span><span>Recipients</span><span>Opens</span><span>Clicks</span>
        </div>
        {recent.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No campaigns yet — create your first one</div>
        ) : recent.map((c) => (
          <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.subject}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: `${statusColor[c.status] ?? "var(--obs-muted)"}18`, color: statusColor[c.status] ?? "var(--obs-muted)" }}>{c.status}</span>
            <p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.recipientCount.toLocaleString()}</p>
            <p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.openCount.toLocaleString()}</p>
            <p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.clickCount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
