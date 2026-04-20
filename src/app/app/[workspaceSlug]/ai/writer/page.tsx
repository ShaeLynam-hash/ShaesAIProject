"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Copy, Check, PenLine, Mail, MessageSquare, FileText, Bell, UserCheck, Share2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Template {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: Array<{ key: string; label: string; placeholder: string; multiline?: boolean }>;
}

const TEMPLATES: Template[] = [
  {
    id: "email_campaign",
    label: "Email Campaign",
    description: "Marketing email with hook, value prop, and CTA",
    icon: Mail,
    color: "#6366F1",
    fields: [
      { key: "audience",  label: "Target Audience",    placeholder: "e.g. existing clients, new leads" },
      { key: "goal",      label: "Campaign Goal",       placeholder: "e.g. promote new service, re-engage dormant clients" },
      { key: "tone",      label: "Tone",                placeholder: "e.g. professional, casual, urgent" },
    ],
  },
  {
    id: "sms_message",
    label: "SMS Message",
    description: "Under 160 characters — direct and punchy",
    icon: MessageSquare,
    color: "#22C55E",
    fields: [
      { key: "audience", label: "Audience",  placeholder: "e.g. all customers" },
      { key: "goal",     label: "Goal",      placeholder: "e.g. flash sale, appointment reminder" },
      { key: "tone",     label: "Tone",      placeholder: "e.g. urgent, friendly" },
    ],
  },
  {
    id: "sales_proposal",
    label: "Sales Proposal",
    description: "Full proposal: problem, solution, deliverables, pricing",
    icon: FileText,
    color: "#F59E0B",
    fields: [
      { key: "client",   label: "Client Name",         placeholder: "e.g. Acme Corp" },
      { key: "service",  label: "Service / Product",   placeholder: "e.g. website redesign, monthly coaching" },
      { key: "price",    label: "Investment / Price",  placeholder: "e.g. $2,500/month" },
      { key: "benefits", label: "Key Benefits",        placeholder: "e.g. save 10 hours/week, 3x more leads" },
    ],
  },
  {
    id: "invoice_reminder",
    label: "Invoice Reminder",
    description: "Professional payment reminder email",
    icon: Bell,
    color: "#EF4444",
    fields: [
      { key: "client",  label: "Client Name",    placeholder: "e.g. John Smith" },
      { key: "invoice", label: "Invoice #",       placeholder: "e.g. INV-2024-001" },
      { key: "amount",  label: "Amount Due",      placeholder: "e.g. $1,200" },
      { key: "days",    label: "Days Overdue",    placeholder: "e.g. 7" },
    ],
  },
  {
    id: "followup_email",
    label: "Follow-up Email",
    description: "Short, warm follow-up after a meeting or call",
    icon: UserCheck,
    color: "#EC4899",
    fields: [
      { key: "contact", label: "Contact Name",     placeholder: "e.g. Sarah Johnson" },
      { key: "last",    label: "Last Interaction", placeholder: "e.g. discovery call last Tuesday" },
      { key: "goal",    label: "Next Step Goal",   placeholder: "e.g. schedule a demo, send proposal" },
    ],
  },
  {
    id: "welcome_email",
    label: "Welcome Email",
    description: "Warm onboarding email for new clients",
    icon: UserCheck,
    color: "#06B6D4",
    fields: [
      { key: "client",     label: "Client Name",   placeholder: "e.g. Alex Torres" },
      { key: "service",    label: "Service",        placeholder: "e.g. monthly SEO package" },
      { key: "next_steps", label: "Next Steps",     placeholder: "e.g. onboarding call, fill intake form" },
    ],
  },
  {
    id: "social_post",
    label: "Social Media Post",
    description: "Engaging post for LinkedIn, Instagram, or Twitter",
    icon: Share2,
    color: "#8B5CF6",
    fields: [
      { key: "platform", label: "Platform",  placeholder: "e.g. LinkedIn, Instagram" },
      { key: "topic",    label: "Topic",     placeholder: "e.g. client success story, service launch" },
      { key: "tone",     label: "Tone",      placeholder: "e.g. inspiring, informative, conversational" },
      { key: "cta",      label: "Call to Action", placeholder: "e.g. DM us, visit our website" },
    ],
  },
  {
    id: "custom",
    label: "Custom Prompt",
    description: "Write anything — just describe what you need",
    icon: Pencil,
    color: "var(--obs-muted)",
    fields: [
      { key: "custom_prompt", label: "What do you want to write?", placeholder: "e.g. Write a 3-sentence bio for my landscaping business that focuses on eco-friendly practices", multiline: true },
    ],
  },
];

export default function WriterPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setOutput("");

    const isCustom = selectedTemplate.id === "custom";

    const res = await fetch("/api/ai/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: isCustom ? undefined : selectedTemplate.id,
        variables: isCustom ? undefined : values,
        customPrompt: isCustom ? values.custom_prompt : undefined,
        businessName: workspaceSlug,
      }),
    });

    if (res.ok) {
      const { content } = await res.json();
      setOutput(content);
    } else {
      setOutput("Failed to generate content. Please check your API key in Settings.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setValues({});
    setOutput("");
  };

  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Writer</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Generate emails, proposals, SMS, and more — powered by Claude
        </p>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-5 items-start">
        {/* Template sidebar */}
        <div className="space-y-1">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            const isActive = selectedTemplate.id === t.id;
            return (
              <button key={t.id} onClick={() => handleSelectTemplate(t)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                style={{
                  background: isActive ? `${t.color}18` : "transparent",
                  border: `1px solid ${isActive ? t.color : "transparent"}`,
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${t.color}18` }}>
                  <Icon size={13} style={{ color: t.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate"
                    style={{ color: isActive ? "var(--obs-text)" : "var(--obs-muted)" }}>
                    {t.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form + output */}
        <div className="space-y-4">
          {/* Template header */}
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${selectedTemplate.color}18` }}>
              <selectedTemplate.icon size={16} style={{ color: selectedTemplate.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{selectedTemplate.label}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{selectedTemplate.description}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="p-4 rounded-xl border space-y-3"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            {selectedTemplate.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>{field.label}</Label>
                {field.multiline ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                    style={inputStyle}
                  />
                ) : (
                  <Input
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              style={{ background: "var(--obs-accent)" }}>
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                <><PenLine size={14} /> Generate</>
              )}
            </button>
          </div>

          {/* Output */}
          {(output || loading) && (
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--obs-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--obs-text)" }}>Generated Content</p>
                {output && (
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: copied ? "#22C55E18" : "var(--obs-elevated)",
                      color: copied ? "#22C55E" : "var(--obs-muted)",
                    }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center gap-2" style={{ color: "var(--obs-muted)" }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm">Writing…</span>
                  </div>
                ) : (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--obs-text)", fontFamily: "inherit" }}>
                    {output}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
