"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Star, Send, Users, MessageSquare, Mail, Globe, CheckCircle2, Search, RefreshCw } from "lucide-react";

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const REVIEW_PLATFORMS = [
  { name: "Google", url: "https://g.page/r/", color: "#4285F4", icon: "G" },
  { name: "Yelp", url: "https://yelp.com/biz/", color: "#FF1A1A", icon: "Y" },
  { name: "Facebook", url: "https://facebook.com/", color: "#1877F2", icon: "f" },
  { name: "Trustpilot", url: "https://trustpilot.com/review/", color: "#00B67A", icon: "T" },
  { name: "Custom URL", url: "", color: "#F59E0B", icon: "✦" },
];

export default function ReviewsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<"sms" | "email" | "both">("email");
  const [platform, setPlatform] = useState(REVIEW_PLATFORMS[0]);
  const [reviewLink, setReviewLink] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [stats] = useState({ sent: 0, opened: 0, clicked: 0 });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/crm/contacts?workspace=${workspaceSlug}&limit=200`);
    const data = await res.json();
    setContacts(data.contacts ?? []);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const name = `${c.firstName} ${c.lastName ?? ""}`.toLowerCase();
    return !q || name.includes(q) || c.email?.includes(q) || c.phone?.includes(q);
  }).filter(c => {
    if (channel === "email") return !!c.email;
    if (channel === "sms") return !!c.phone;
    return c.email || c.phone;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendRequests = async () => {
    if (!selected.size) return;
    setSending(true);
    setResult(null);
    const link = reviewLink || platform.url;
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        contactIds: [...selected],
        channel,
        reviewLink: link,
        customMessage: useCustom ? customMessage : undefined,
      }),
    });
    const data = await res.json();
    setSending(false);
    setResult(data);
    setSelected(new Set());
  };

  const defaultPreview = `Hi {{first_name}}! Thank you for choosing {{business_name}}. We'd love to hear your feedback — could you take a moment to leave us a review? ${reviewLink || platform.url} — {{business_name}}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Review Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Automatically ask happy customers for reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Requests Sent", value: stats.sent, icon: Send, color: "#3B82F6" },
          { label: "Opened", value: stats.opened, icon: Mail, color: "#F59E0B" },
          { label: "Clicked Review Link", value: stats.clicked, icon: Star, color: "#10B981" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Config */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border p-4 space-y-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Review Platform</h3>
            <div className="grid grid-cols-3 gap-2">
              {REVIEW_PLATFORMS.map(p => (
                <button key={p.name} onClick={() => { setPlatform(p); if (p.name !== "Custom URL") setReviewLink(""); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all"
                  style={{
                    borderColor: platform.name === p.name ? p.color : "var(--obs-border)",
                    background: platform.name === p.name ? p.color + "15" : "var(--obs-elevated)",
                    color: platform.name === p.name ? p.color : "var(--obs-muted)",
                  }}>
                  <span className="font-bold text-base" style={{ color: p.color }}>{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>
                {platform.name === "Custom URL" ? "Review URL" : `${platform.name} Review URL`}
              </label>
              <input value={reviewLink} onChange={e => setReviewLink(e.target.value)}
                placeholder={platform.url || "https://your-review-link.com"}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Send Via</h3>
            <div className="flex gap-2">
              {(["email", "sms", "both"] as const).map(ch => (
                <button key={ch} onClick={() => setChannel(ch)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium capitalize border"
                  style={{ borderColor: channel === ch ? "var(--obs-accent)" : "var(--obs-border)", background: channel === ch ? "var(--obs-accent)" : "var(--obs-elevated)", color: channel === ch ? "#fff" : "var(--obs-muted)" }}>
                  {ch === "email" ? <><Mail size={11} className="inline mr-1" />Email</> : ch === "sms" ? <><MessageSquare size={11} className="inline mr-1" />SMS</> : "Both"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Message</h3>
              <button onClick={() => setUseCustom(u => !u)} className="text-xs" style={{ color: "var(--obs-accent)" }}>
                {useCustom ? "Use default" : "Customize"}
              </button>
            </div>
            {useCustom ? (
              <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows={5}
                placeholder="Use {{first_name}}, {{business_name}}, {{review_link}} as placeholders"
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            ) : (
              <div className="rounded-lg border p-3 text-xs" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-muted)", lineHeight: 1.6 }}>
                {defaultPreview}
              </div>
            )}
          </div>
        </div>

        {/* Right: Contact selector */}
        <div className="col-span-3 rounded-xl border flex flex-col" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", maxHeight: 520 }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
                Select Recipients
                {selected.size > 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--obs-accent)", color: "#fff" }}>{selected.size} selected</span>}
              </h3>
              <button onClick={toggleAll} className="text-xs" style={{ color: "var(--obs-accent)" }}>
                {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--obs-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm"
                style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-xs" style={{ color: "var(--obs-muted)" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-xs" style={{ color: "var(--obs-muted)" }}>No contacts match your filter</div>
            ) : (
              filtered.map(c => (
                <div key={c.id} onClick={() => toggle(c.id)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b transition-colors hover:bg-opacity-50"
                  style={{ borderColor: "var(--obs-border)", background: selected.has(c.id) ? "rgba(245,158,11,0.08)" : "transparent" }}>
                  <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selected.has(c.id) ? "var(--obs-accent)" : "var(--obs-border)", background: selected.has(c.id) ? "var(--obs-accent)" : "transparent" }}>
                    {selected.has(c.id) && <CheckCircle2 size={12} style={{ color: "#fff" }} />}
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                    {c.firstName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{c.firstName} {c.lastName}</p>
                    <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{c.email ?? c.phone ?? "No contact info"}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {c.email && <span className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#3B82F620" }}><Mail size={10} style={{ color: "#3B82F6" }} /></span>}
                    {c.phone && <span className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#10B98120" }}><MessageSquare size={10} style={{ color: "#10B981" }} /></span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t" style={{ borderColor: "var(--obs-border)" }}>
            {result && (
              <div className="mb-3 flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: "#10B98120", color: "#10B981" }}>
                <CheckCircle2 size={14} />{result.sent} sent successfully{result.failed > 0 ? `, ${result.failed} failed` : ""}
              </div>
            )}
            <button onClick={sendRequests} disabled={sending || selected.size === 0}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "var(--obs-accent)", color: "#fff", opacity: sending || selected.size === 0 ? 0.6 : 1 }}>
              {sending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send {selected.size > 0 ? selected.size : ""} Review Request{selected.size !== 1 ? "s" : ""}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
