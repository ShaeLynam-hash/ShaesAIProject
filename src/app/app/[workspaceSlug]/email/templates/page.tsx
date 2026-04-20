"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Edit2, Copy, X, Eye, Send, Bold, Italic, Link } from "lucide-react";

const BASE_TEMPLATES = [
  { name: "Welcome Email",    desc: "Onboard new users", category: "Transactional",
    subject: "Welcome to {{business_name}}! 🎉",
    body: `Hi {{first_name}},\n\nWelcome to {{business_name}}! We're thrilled to have you on board.\n\nHere's what you can expect:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nTo get started, simply reply to this email or visit your dashboard.\n\nBest,\n{{sender_name}}` },
  { name: "Invoice",          desc: "Send invoice to client", category: "Billing",
    subject: "Invoice #{{invoice_number}} from {{business_name}}",
    body: `Hi {{first_name}},\n\nPlease find attached invoice #{{invoice_number}} for the amount of {{amount}}.\n\nDue date: {{due_date}}\n\nYou can pay securely at: {{payment_link}}\n\nThank you for your business!\n\n{{sender_name}}` },
  { name: "Payment Receipt",  desc: "Confirm successful payment", category: "Billing",
    subject: "Payment received — thank you!",
    body: `Hi {{first_name}},\n\nWe've received your payment of {{amount}} on {{date}}.\n\nTransaction ID: {{transaction_id}}\n\nIf you have any questions, don't hesitate to reach out.\n\nThanks,\n{{sender_name}}` },
  { name: "Follow-up",        desc: "Follow up after meeting", category: "Sales",
    subject: "Great meeting you, {{first_name}}!",
    body: `Hi {{first_name}},\n\nIt was great meeting with you earlier. I wanted to follow up on our conversation about {{topic}}.\n\nAs we discussed:\n• [Key point 1]\n• [Key point 2]\n\nWould you like to schedule a next step? I'm available {{availability}}.\n\nLooking forward to working with you!\n\n{{sender_name}}` },
  { name: "Newsletter",       desc: "Weekly newsletter", category: "Marketing",
    subject: "{{business_name}} Newsletter — {{month}}",
    body: `Hi {{first_name}},\n\nHere's what's new at {{business_name}} this week:\n\n📌 Update 1\n[Write update here]\n\n📌 Update 2\n[Write update here]\n\n📌 Tip of the Week\n[Write tip here]\n\nStay awesome,\n{{sender_name}}` },
  { name: "Promotional",      desc: "Sale or special offer", category: "Marketing",
    subject: "🎁 Exclusive offer just for you, {{first_name}}",
    body: `Hi {{first_name}},\n\nWe have an exclusive offer just for you!\n\n🔥 {{offer_details}}\n\nUse code: {{promo_code}}\nValid until: {{expiry_date}}\n\n[CTA Button: Claim Your Offer]\n\nDon't miss out — this offer expires soon!\n\n{{sender_name}}` },
  { name: "Re-engagement",    desc: "Win back inactive users", category: "Marketing",
    subject: "We miss you, {{first_name}} 👋",
    body: `Hi {{first_name}},\n\nWe noticed you haven't been around in a while, and we miss you!\n\nHere's what you've been missing:\n• [New feature]\n• [New offer]\n\nCome back and see what's new — we'd love to have you back.\n\n[CTA: Come Back Now]\n\n{{sender_name}}` },
  { name: "Trial Expiring",   desc: "Trial ending reminder", category: "Lifecycle",
    subject: "Your trial ends in {{days}} days",
    body: `Hi {{first_name}},\n\nJust a heads-up — your free trial of {{business_name}} expires in {{days}} days.\n\nTo keep access to all features, upgrade to a paid plan before {{expiry_date}}.\n\n[CTA: Upgrade Now]\n\nHave questions? Just reply to this email.\n\n{{sender_name}}` },
  { name: "Appointment Reminder", desc: "Remind clients of upcoming appointments", category: "Transactional",
    subject: "Reminder: Your appointment on {{date}}",
    body: `Hi {{first_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Location: {{location}}\n\nNeed to reschedule? Please let us know at least 24 hours in advance.\n\nSee you soon!\n{{sender_name}}` },
  { name: "Cancellation",     desc: "Offboarding with save offer", category: "Lifecycle",
    subject: "We're sorry to see you go, {{first_name}}",
    body: `Hi {{first_name}},\n\nWe received your cancellation request and have processed it.\n\nBefore you go, we wanted to offer you one last thing:\n\n{{save_offer}}\n\nIf you change your mind or have any feedback, we'd love to hear from you.\n\nThank you for being a customer.\n\n{{sender_name}}` },
];

const CAT_COLORS: Record<string, string> = {
  Transactional: "#6366F1", Billing: "#22C55E", Marketing: "#EC4899",
  Sales: "#F59E0B", Lifecycle: "#818CF8",
};

type Tab = "list" | "editor";

export default function TemplatesPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [tab, setTab] = useState<Tab>("list");
  const [editingTemplate, setEditingTemplate] = useState<typeof BASE_TEMPLATES[0] | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [filterCat, setFilterCat] = useState("All");

  const openEditor = (tmpl: typeof BASE_TEMPLATES[0]) => {
    setEditingTemplate(tmpl);
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    setTab("editor");
  };

  const copyBody = () => { navigator.clipboard.writeText(body); toast.success("Copied!"); };

  const insertToken = (token: string) => {
    setBody((p) => p + `{{${token}}}`);
  };

  const sendTest = async () => {
    if (!testEmail.trim()) { toast.error("Enter a test email"); return; }
    setSending(true);
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, to: testEmail, subject, htmlBody: body.replace(/\n/g, "<br>"), fromName: "Test" }),
    });
    if (res.ok) { toast.success("Test email sent!"); setShowSend(false); }
    else { const err = await res.json(); toast.error(err.error ?? "Failed"); }
    setSending(false);
  };

  const categories = ["All", ...Array.from(new Set(BASE_TEMPLATES.map((t) => t.category)))];
  const filtered = filterCat === "All" ? BASE_TEMPLATES : BASE_TEMPLATES.filter((t) => t.category === filterCat);

  if (tab === "editor" && editingTemplate) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setTab("list")} className="text-sm flex items-center gap-1" style={{ color: "var(--obs-muted)" }}>
              <X size={13} /> Back
            </button>
            <span style={{ color: "var(--obs-muted)" }}>/</span>
            <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>{editingTemplate.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
              <Eye size={12} /> {preview ? "Edit" : "Preview"}
            </button>
            <button onClick={copyBody}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
              <Copy size={12} /> Copy
            </button>
            <button onClick={() => setShowSend(!showSend)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "var(--obs-accent)" }}>
              <Send size={12} /> Test Send
            </button>
          </div>
        </div>

        {showSend && (
          <div className="flex gap-2 p-3 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="your@email.com"
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            <button onClick={sendTest} disabled={sending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--obs-accent)" }}>
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--obs-muted)" }}>Subject line</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none font-medium"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
        </div>

        {/* Tokens */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs mr-1" style={{ color: "var(--obs-muted)" }}>Insert:</span>
          {["first_name","business_name","sender_name","amount","date","link"].map((t) => (
            <button key={t} onClick={() => insertToken(t)}
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-accent)" }}>
              {"{{"}{t}{"}}"}
            </button>
          ))}
        </div>

        {/* Body editor or preview */}
        {preview ? (
          <div className="rounded-xl border p-6" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--obs-text)" }}>{subject}</p>
            <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--obs-text)", lineHeight: 1.8 }}>
              {body}
            </div>
          </div>
        ) : (
          <textarea value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-4 rounded-xl border text-sm outline-none resize-none font-mono"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)", minHeight: 420 }} />
        )}

        <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
          Use {"{{variable}}"} placeholders — they&apos;ll be replaced when the email is sent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Email Templates</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{BASE_TEMPLATES.length} templates — click to edit</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: filterCat === c ? "var(--obs-accent)" : "var(--obs-elevated)", color: filterCat === c ? "#fff" : "var(--obs-muted)" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((tmpl) => {
          const color = CAT_COLORS[tmpl.category] ?? "#6366F1";
          return (
            <div key={tmpl.name}
              className="flex items-start gap-4 p-5 rounded-xl border cursor-pointer group transition-all"
              style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}
              onClick={() => openEditor(tmpl)}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <FileText size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{tmpl.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${color}18`, color }}>{tmpl.category}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{tmpl.desc}</p>
                <p className="text-[10px] mt-2 font-mono truncate" style={{ color: "var(--obs-muted)" }}>{tmpl.subject}</p>
              </div>
              <Edit2 size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--obs-muted)" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
