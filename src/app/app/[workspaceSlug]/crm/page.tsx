import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, TrendingUp, DollarSign, Target, ArrowRight } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

export default async function CrmPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const [contactCount, dealCount, dealStats, recentContacts, stageBreakdown] = await Promise.all([
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    prisma.deal.count({ where: { workspaceId: workspace.id } }),
    prisma.deal.aggregate({
      where: { workspaceId: workspace.id },
      _sum: { value: true },
    }),
    prisma.contact.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      where: { workspaceId: workspace.id },
      _sum: { value: true },
      _count: true,
    }),
  ]);

  const wonDeals = await prisma.deal.aggregate({
    where: { workspaceId: workspace.id, stage: "CLOSED_WON" },
    _sum: { value: true },
  });

  const stats = [
    { label: "Total Contacts", value: contactCount.toLocaleString(), icon: Users,       color: "var(--obs-accent)"  },
    { label: "Active Deals",   value: dealCount.toLocaleString(),    icon: TrendingUp,  color: "#F59E0B"             },
    { label: "Pipeline Value", value: fmt(dealStats._sum.value ?? 0),icon: DollarSign,  color: "var(--obs-success)" },
    { label: "Won Revenue",    value: fmt(wonDeals._sum.value ?? 0), icon: Target,      color: "#EC4899"             },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>CRM</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Contacts, deals, and pipeline management</p>
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

      <div className="grid grid-cols-2 gap-6">
        {/* Stage breakdown */}
        <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>Deal Stages</h3>
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const data = stageBreakdown.find((s) => s.stage === stage);
              const count = data?._count ?? 0;
              const value = data?._sum.value ?? 0;
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{
                      background: stage === "CLOSED_WON" ? "var(--obs-success)"
                        : stage === "CLOSED_LOST" ? "var(--obs-danger)"
                        : stage === "NEGOTIATION" ? "#F59E0B"
                        : "var(--obs-accent)"
                    }} />
                    <span className="text-xs" style={{ color: "var(--obs-text)" }}>
                      {stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{count} deals</span>
                    <span className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>{fmt(value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Recent Contacts</h3>
            <Link href={`/app/${workspaceSlug}/crm/contacts`} className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-accent)" }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--obs-muted)" }}>No contacts yet</p>
          ) : recentContacts.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--obs-border)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--obs-elevated)", color: "var(--obs-accent)" }}>
                {c.firstName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>
                  {c.firstName} {c.lastName ?? ""}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{c.company ?? c.email ?? "—"}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
