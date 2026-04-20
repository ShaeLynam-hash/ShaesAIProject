"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Zap } from "lucide-react";

interface Insight {
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  category: "revenue" | "expenses" | "growth" | "risk" | "opportunity" | "action";
}

const PRIORITY_META = {
  high:   { label: "High",   color: "#EF4444", bg: "#EF444418" },
  medium: { label: "Medium", color: "#F59E0B", bg: "#F59E0B18" },
  low:    { label: "Low",    color: "#22C55E", bg: "#22C55E18" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  revenue:     TrendingUp,
  expenses:    TrendingDown,
  growth:      TrendingUp,
  risk:        AlertTriangle,
  opportunity: Lightbulb,
  action:      Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  revenue:     "#22C55E",
  expenses:    "#EF4444",
  growth:      "#6366F1",
  risk:        "#F59E0B",
  opportunity: "#EC4899",
  action:      "#F59E0B",
};

export default function InsightsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to generate insights");
      } else {
        const { insights: data } = await res.json();
        setInsights(data ?? []);
        setLastUpdated(new Date());
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { generate(); }, [generate]);

  const highPriority = insights.filter((i) => i.priority === "high");
  const rest = insights.filter((i) => i.priority !== "high");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Business Insights</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {lastUpdated
              ? `Analyzed ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Claude analyzes your live business data"}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--obs-accent)" }}>
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
            : <><RefreshCw size={14} /> Refresh</>}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border text-sm"
          style={{ background: "#EF444418", borderColor: "#EF4444", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {loading && insights.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--obs-accent)" }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>Analyzing your business…</p>
            <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>
              Claude is reading your contacts, revenue, invoices, and pipeline
            </p>
          </div>
        </div>
      )}

      {!loading && insights.length > 0 && (
        <>
          {/* High priority section */}
          {highPriority.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#EF4444" }}>
                Needs Attention
              </p>
              {highPriority.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="space-y-3">
              {highPriority.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>
                  Insights & Opportunities
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {rest.map((insight, i) => (
                  <InsightCard key={i} insight={insight} compact />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && insights.length === 0 && !error && (
        <div className="py-16 text-center">
          <Lightbulb size={32} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No insights generated yet</p>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Click Refresh to analyze your business data</p>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, compact }: { insight: Insight; compact?: boolean }) {
  const IconEl = CATEGORY_ICONS[insight.category] ?? Lightbulb;
  const catColor = CATEGORY_COLORS[insight.category] ?? "var(--obs-muted)";
  const priorityMeta = PRIORITY_META[insight.priority];

  return (
    <div className="p-4 rounded-xl border"
      style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${catColor}18` }}>
          <IconEl size={15} style={{ color: catColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{insight.title}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: priorityMeta.bg, color: priorityMeta.color }}>
              {priorityMeta.label}
            </span>
          </div>
          <p className={`leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: "var(--obs-muted)" }}>
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
