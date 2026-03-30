import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface Props { params: Promise<{ workspaceSlug: string }> }

const STAGES = [
  { key: "LEAD",        label: "Lead",        color: "#6366F1" },
  { key: "QUALIFIED",   label: "Qualified",   color: "#818CF8" },
  { key: "PROPOSAL",    label: "Proposal",    color: "#F59E0B" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#EC4899" },
  { key: "CLOSED_WON",  label: "Closed Won",  color: "#22C55E" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "#EF4444" },
];

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n); }

export default async function PipelinePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  const deals = await prisma.deal.findMany({
    where: { workspaceId: workspace.id },
    include: { contact: true },
    orderBy: { value: "desc" },
  });

  const byStage = STAGES.map(({ key, label, color }) => ({
    key, label, color,
    deals: deals.filter((d) => d.stage === key),
    total: deals.filter((d) => d.stage === key).reduce((s, d) => s + d.value, 0),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Pipeline</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          {deals.length} deals · {fmt(deals.reduce((s, d) => s + d.value, 0))} total
        </p>
      </div>

      <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-2">
        {byStage.map(({ key, label, color, deals: stagDeals, total }) => (
          <div key={key} className="min-w-[180px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold" style={{ color: "var(--obs-text)" }}>{label}</span>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                {stagDeals.length}
              </span>
            </div>
            <div className="text-xs font-medium mb-3 px-1" style={{ color }}>
              {fmt(total)}
            </div>
            <div className="space-y-2">
              {stagDeals.length === 0 ? (
                <div className="h-16 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: "var(--obs-border)" }}>
                  <span className="text-[10px]" style={{ color: "var(--obs-muted)" }}>No deals</span>
                </div>
              ) : stagDeals.map((deal) => (
                <div key={deal.id} className="p-3 rounded-lg border"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                  <p className="text-xs font-semibold mb-1 line-clamp-2" style={{ color: "var(--obs-text)" }}>{deal.title}</p>
                  <p className="text-xs font-bold" style={{ color }}>{fmt(deal.value)}</p>
                  {deal.contact && (
                    <p className="text-[10px] mt-1 truncate" style={{ color: "var(--obs-muted)" }}>
                      {deal.contact.firstName} {deal.contact.lastName ?? ""}
                      {deal.contact.company ? ` · ${deal.contact.company}` : ""}
                    </p>
                  )}
                  {deal.probability > 0 && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                        <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: color, opacity: 0.7 }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
