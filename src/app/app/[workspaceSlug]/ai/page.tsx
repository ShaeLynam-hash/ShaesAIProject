import Link from "next/link";
import { Sparkles, Lightbulb, PenLine, MessageSquare, Cpu, ArrowRight, Bot } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function AiPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const features = [
    {
      title: "Business Assistant",
      desc: "AI that knows your live data — contacts, revenue, invoices, pipeline. Ask anything about your business.",
      icon: Sparkles,
      href: "assistant",
      color: "#F59E0B",
      badge: "NEW",
    },
    {
      title: "AI Insights",
      desc: "Claude analyzes your business data and surfaces 6 actionable insights ranked by priority.",
      icon: Lightbulb,
      href: "insights",
      color: "#EC4899",
      badge: "NEW",
    },
    {
      title: "AI Writer",
      desc: "Generate emails, SMS campaigns, sales proposals, invoce reminders, and social posts in seconds.",
      icon: PenLine,
      href: "writer",
      color: "#6366F1",
      badge: "NEW",
    },
    {
      title: "AI Chat",
      desc: "General-purpose conversational AI powered by Claude and GPT-4. Drafts, analysis, summaries.",
      icon: MessageSquare,
      href: "chat",
      color: "#22C55E",
    },
    {
      title: "Model Selection",
      desc: "Choose from Claude Sonnet, Opus, Haiku, GPT-4o, and more. Switch models without changing code.",
      icon: Cpu,
      href: "models",
      color: "#06B6D4",
    },
  ];

  const models = [
    { name: "Claude Sonnet 4.6", provider: "Anthropic", context: "200K tokens", speed: "Fast",    color: "#EC4899", recommended: true  },
    { name: "Claude Opus 4.6",   provider: "Anthropic", context: "200K tokens", speed: "Smartest",color: "#8B5CF6", recommended: false },
    { name: "Claude Haiku 4.5",  provider: "Anthropic", context: "200K tokens", speed: "Fastest", color: "#06B6D4", recommended: false },
    { name: "GPT-4o",            provider: "OpenAI",    context: "128K tokens", speed: "Fast",    color: "#22C55E", recommended: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Brain</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Your intelligent business co-pilot — powered by Anthropic Claude, fully under your brand
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {features.slice(0, 3).map(({ title, desc, icon: Icon, href, color, badge }) => (
          <Link key={title} href={`/app/${workspaceSlug}/ai/${href}`}
            className="group flex flex-col gap-4 p-5 rounded-xl border hover:border-[var(--obs-accent)] transition-colors"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              {badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "var(--obs-accent)", color: "#fff" }}>
                  {badge}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{title}</p>
                <ArrowRight size={12} style={{ color: "var(--obs-muted)" }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--obs-muted)" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.slice(3).map(({ title, desc, icon: Icon, href, color }) => (
          <Link key={title} href={`/app/${workspaceSlug}/ai/${href}`}
            className="group flex items-start gap-4 p-4 rounded-xl border hover:border-[var(--obs-accent)] transition-colors"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{title}</p>
                <ArrowRight size={12} style={{ color: "var(--obs-muted)" }} />
              </div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Models */}
      <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>Active Models</h3>
        <div className="grid grid-cols-2 gap-3">
          {models.map(({ name, provider, context, speed, color, recommended }) => (
            <div key={name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--obs-elevated)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Bot size={14} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--obs-text)" }}>{name}</p>
                  {recommended && (
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded shrink-0"
                      style={{ background: "var(--obs-accent)", color: "#fff" }}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-[10px]" style={{ color: "var(--obs-muted)" }}>
                  {provider} · {context} · {speed}
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--obs-success)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
