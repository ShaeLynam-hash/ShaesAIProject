import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RefreshCw, TrendingUp } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function SubscriptionsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  // Pull recurring products as proxy for subscriptions
  const recurringProducts = await prisma.product.findMany({
    where: { workspaceId: workspace.id, type: "RECURRING", active: true },
    orderBy: { createdAt: "desc" },
  });

  const monthlyRevenue = recurringProducts
    .filter((p) => p.interval === "month")
    .reduce((sum, p) => sum + p.price, 0);
  const annualRevenue = recurringProducts
    .filter((p) => p.interval === "year")
    .reduce((sum, p) => sum + p.price / 12, 0);
  const mrr = monthlyRevenue + annualRevenue;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Subscriptions</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Recurring revenue and active plans
        </p>
      </div>

      {/* MRR / ARR cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "MRR", value: fmt(mrr), sub: "Monthly recurring revenue" },
          { label: "ARR", value: fmt(mrr * 12), sub: "Annual recurring revenue" },
          { label: "Active Plans", value: recurringProducts.length.toString(), sub: "Recurring products" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="p-5 rounded-xl border"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "var(--obs-elevated)" }}>
              <TrendingUp size={15} style={{ color: "var(--obs-accent)" }} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Plan</span><span>Price</span><span>Interval</span><span>Status</span>
        </div>

        {recurringProducts.length === 0 ? (
          <div className="py-12 text-center">
            <RefreshCw size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No subscriptions yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
              Create a recurring product in the Products tab to get started
            </p>
          </div>
        ) : recurringProducts.map((p) => (
          <div key={p.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{p.name}</p>
              {p.description && (
                <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{p.description}</p>
              )}
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
              {fmt(p.price)}
            </p>
            <span className="text-xs px-2 py-1 rounded-md inline-block capitalize"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
              {p.interval ?? "month"}ly
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
              style={{ background: "#22C55E18", color: "var(--obs-success)" }}>Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}
