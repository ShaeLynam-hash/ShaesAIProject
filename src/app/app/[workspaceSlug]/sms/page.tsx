import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MessageSquare, Send, CheckCircle, Users } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function SmsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const [total, sent, totals] = await Promise.all([
    prisma.smsCampaign.count({ where: { workspaceId: workspace.id } }),
    prisma.smsCampaign.count({ where: { workspaceId: workspace.id, status: "SENT" } }),
    prisma.smsCampaign.aggregate({ where: { workspaceId: workspace.id }, _sum: { recipientCount: true, deliveredCount: true } }),
  ]);

  const recipients = totals._sum.recipientCount ?? 0;
  const delivered = totals._sum.deliveredCount ?? 0;
  const deliveryRate = recipients > 0 ? ((delivered / recipients) * 100).toFixed(1) : "0.0";

  const recent = await prisma.smsCampaign.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>SMS</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Text message campaigns and notifications</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: total.toString(),           icon: MessageSquare, color: "var(--obs-accent)"  },
          { label: "Campaigns Sent",  value: sent.toString(),            icon: Send,          color: "#6366F1"            },
          { label: "Messages Sent",   value: recipients.toLocaleString(),icon: Users,         color: "#F59E0B"            },
          { label: "Delivery Rate",   value: `${deliveryRate}%`,         icon: CheckCircle,   color: "var(--obs-success)" },
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
        {recent.length === 0 ? <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No SMS campaigns yet</div>
        : recent.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
              <p className="text-xs line-clamp-1" style={{ color: "var(--obs-muted)" }}>{c.message}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>{c.recipientCount.toLocaleString()} sent</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.deliveredCount.toLocaleString()} delivered</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: c.status === "SENT" ? "#22C55E18" : "var(--obs-elevated)", color: c.status === "SENT" ? "var(--obs-success)" : "var(--obs-muted)" }}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
