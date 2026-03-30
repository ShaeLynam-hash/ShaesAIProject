import { Bot } from "lucide-react";

const MODELS = [
  { name: "Claude Sonnet 4.6", provider: "Anthropic", id: "claude-sonnet-4-6", context: "200K", type: "Chat / Code / Analysis", color: "#EC4899", recommended: true },
  { name: "Claude Opus 4.6",   provider: "Anthropic", id: "claude-opus-4-6",   context: "200K", type: "Complex reasoning",       color: "#8B5CF6", recommended: false },
  { name: "Claude Haiku 4.5",  provider: "Anthropic", id: "claude-haiku-4-5",  context: "200K", type: "Fast & lightweight",       color: "#06B6D4", recommended: false },
  { name: "GPT-4o",            provider: "OpenAI",    id: "gpt-4o",            context: "128K", type: "Multimodal",               color: "#22C55E", recommended: false },
  { name: "GPT-4o mini",       provider: "OpenAI",    id: "gpt-4o-mini",       context: "128K", type: "Fast & cheap",             color: "#10B981", recommended: false },
];

export default function ModelsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Models</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Select models to power your AI features — all billed under your account</p>
      </div>
      <div className="space-y-3">
        {MODELS.map(({ name, provider, id, context, type, color, recommended }) => (
          <div key={id} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
              <Bot size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{name}</p>
                {recommended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--obs-accent)", color: "#fff" }}>RECOMMENDED</span>}
              </div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{provider} · {context} context · {type}</p>
            </div>
            <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--obs-elevated)", color: "var(--obs-accent-2)" }}>{id}</code>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--obs-success)" }} />
              <span className="text-xs" style={{ color: "var(--obs-success)" }}>Available</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
        <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
          Add your API keys in <strong style={{ color: "var(--obs-text)" }}>Settings → Integrations</strong> to enable AI features. Your users will see your platform name — never Anthropic or OpenAI.
        </p>
      </div>
    </div>
  );
}
