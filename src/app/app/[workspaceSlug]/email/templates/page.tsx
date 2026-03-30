import { FileText } from "lucide-react";

const TEMPLATES = [
  { name: "Welcome Email",        desc: "Onboard new users with a warm welcome",         category: "Transactional" },
  { name: "Password Reset",       desc: "Secure password reset with expiring link",       category: "Transactional" },
  { name: "Invoice",              desc: "Professional invoice delivery with PDF link",    category: "Billing"       },
  { name: "Payment Receipt",      desc: "Confirmation email after successful payment",    category: "Billing"       },
  { name: "Newsletter",           desc: "Weekly newsletter with content blocks",          category: "Marketing"     },
  { name: "Promotional",          desc: "Sale announcement with discount code",           category: "Marketing"     },
  { name: "Re-engagement",        desc: "Win back inactive subscribers",                  category: "Marketing"     },
  { name: "Trial Expiring",       desc: "Remind users their trial is ending soon",        category: "Lifecycle"     },
  { name: "Upgrade Prompt",       desc: "Encourage free users to upgrade",                category: "Lifecycle"     },
  { name: "Cancellation",         desc: "Offboarding flow with save offer",               category: "Lifecycle"     },
];

const CAT_COLORS: Record<string, string> = { Transactional: "#6366F1", Billing: "#22C55E", Marketing: "#EC4899", Lifecycle: "#F59E0B" };

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Email Templates</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Pre-built templates for every use case</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map(({ name, desc, category }) => (
          <div key={name} className="flex items-start gap-4 p-5 rounded-xl border cursor-pointer group hover:border-[var(--obs-accent)] transition-colors"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${CAT_COLORS[category]}18` }}>
              <FileText size={16} style={{ color: CAT_COLORS[category] }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${CAT_COLORS[category]}18`, color: CAT_COLORS[category] }}>{category}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
