import Link from "next/link";
import { Bot, MessageSquare, Cpu, Zap, ArrowRight } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function AiPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const features = [
    { title: "AI Chat",          desc: "Conversational AI powered by Claude & GPT-4. Build chatbots, get answers, generate content.", icon: MessageSquare, href: "chat",   color: "#6366F1" },
    { title: "Model Selection",  desc: "Choose from Claude, GPT-4, Gemini, Llama and more. Switch models without changing code.",    icon: Cpu,          href: "models", color: "#EC4899" },
    { title: "Automations",      desc: "Trigger AI actions on events — summarize emails, score leads, draft replies automatically.",  icon: Zap,          href: "../automations", color: "#F59E0B" },
  ];

  const models = [
    { name: "Claude Sonnet 4.6",   provider: "Anthropic", context: "200K tokens", speed: "Fast",   color: "#EC4899" },
    { name: "Claude Opus 4.6",     provider: "Anthropic", context: "200K tokens", speed: "Smart",  color: "#8B5CF6" },
    { name: "GPT-4o",              provider: "OpenAI",    context: "128K tokens", speed: "Fast",   color: "#22C55E" },
    { name: "GPT-4o mini",         provider: "OpenAI",    context: "128K tokens", speed: "Faster", color: "#06B6D4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Workspace</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Powered by Anthropic & OpenAI — fully under your brand</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {features.map(({ title, desc, icon: Icon, href, color }) => (
          <Link key={title} href={`/app/${workspaceSlug}/ai/${href}`} className="group flex items-start gap-4 p-5 rounded-xl border hover:border-[var(--obs-accent)] transition-colors" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{title}</p>
                <ArrowRight size={12} style={{ color: "var(--obs-muted)" }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--obs-muted)" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>Available Models</h3>
        <div className="grid grid-cols-2 gap-3">
          {models.map(({ name, provider, context, speed, color }) => (
            <div key={name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--obs-elevated)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Bot size={14} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{name}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{provider} · {context} · {speed}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#22C55E18", color: "var(--obs-success)" }}>Live</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
