"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquare, Mail, CheckCircle, AlertCircle, Eye, EyeOff,
  Save, Phone, Search, Loader2, Zap, BarChart2, Bot, PhoneMissed,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneNumber { phoneNumber: string; friendlyName: string; region: string; locality: string }
interface Usage { used: number; limit: number; resetAt: string | null; phoneNumber: string | null; provisioned: boolean; plan: string }
interface CommSettings { fromEmail: string | null; fromName: string | null; twilioFromNumber: string | null; twilioConfigured: boolean; resendConfigured: boolean; missedCallTextBack: boolean; missedCallMessage: string | null; aiAutoReply: boolean; aiAutoReplyPrompt: string | null }

const PLAN_LIMITS: Record<string, number> = { FREE: 100, STARTER: 500, PRO: 2000, AGENCY: 10000, ENTERPRISE: 99999 };

export default function CommunicationsSettingsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [settings, setSettings] = useState<CommSettings | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [saving, setSaving] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [areaCode, setAreaCode] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [showTwilioSid, setShowTwilioSid] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [form, setForm] = useState({ twilioAccountSid: "", twilioAuthToken: "", twilioFromNumber: "", resendApiKey: "", fromEmail: "", fromName: "", missedCallTextBack: false, missedCallMessage: "", aiAutoReply: false, aiAutoReplyPrompt: "" });

  const fetchAll = useCallback(async () => {
    const [settingsRes, usageRes] = await Promise.all([
      fetch(`/api/workspaces/settings?workspace=${workspaceSlug}`),
      fetch(`/api/twilio/usage?workspace=${workspaceSlug}`),
    ]);
    if (settingsRes.ok) {
      const { settings: s } = await settingsRes.json();
      setSettings(s);
      setForm((p) => ({ ...p, twilioFromNumber: s.twilioFromNumber ?? "", fromEmail: s.fromEmail ?? "", fromName: s.fromName ?? "", missedCallTextBack: s.missedCallTextBack ?? false, missedCallMessage: s.missedCallMessage ?? "", aiAutoReply: s.aiAutoReply ?? false, aiAutoReplyPrompt: s.aiAutoReplyPrompt ?? "" }));
    }
    if (usageRes.ok) setUsage((await usageRes.json()));
  }, [workspaceSlug]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleProvision = async () => {
    setProvisioning(true);
    const res = await fetch("/api/twilio/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.alreadyProvisioned) toast.success("Already provisioned");
      else toast.success("SMS sub-account created! Now pick a phone number below.");
      fetchAll();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Provisioning failed");
    }
    setProvisioning(false);
  };

  const handleSearch = async () => {
    setSearching(true);
    setAvailableNumbers([]);
    const q = areaCode ? `&areaCode=${areaCode}` : "";
    const res = await fetch(`/api/twilio/numbers/search?workspace=${workspaceSlug}${q}`);
    if (res.ok) {
      const { numbers } = await res.json();
      setAvailableNumbers(numbers);
      if (numbers.length === 0) toast.error("No numbers found for that area code. Try another.");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Search failed");
    }
    setSearching(false);
  };

  const handlePurchase = async (phoneNumber: string) => {
    setPurchasing(phoneNumber);
    const res = await fetch("/api/twilio/numbers/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, phoneNumber }),
    });
    if (res.ok) {
      const { phoneNumber: num } = await res.json();
      toast.success(`${num} is now your SMS number!`);
      setAvailableNumbers([]);
      fetchAll();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Purchase failed");
    }
    setPurchasing(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, string | boolean | undefined> = {
      workspaceSlug,
      fromEmail: form.fromEmail || undefined,
      fromName: form.fromName || undefined,
      missedCallTextBack: form.missedCallTextBack,
      missedCallMessage: form.missedCallMessage || undefined,
      aiAutoReply: form.aiAutoReply,
      aiAutoReplyPrompt: form.aiAutoReplyPrompt || undefined,
    };
    if (form.resendApiKey) payload.resendApiKey = form.resendApiKey;
    if (form.twilioAccountSid) payload.twilioAccountSid = form.twilioAccountSid;
    if (form.twilioAuthToken)  payload.twilioAuthToken = form.twilioAuthToken;

    const res = await fetch("/api/workspaces/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success("Saved"); setForm((p) => ({ ...p, twilioAccountSid: "", twilioAuthToken: "", resendApiKey: "" })); fetchAll(); }
    else toast.error("Failed to save");
    setSaving(false);
  };

  const usagePct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const usageColor = usagePct >= 90 ? "#EF4444" : usagePct >= 70 ? "#F59E0B" : "var(--obs-success)";
  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Communications</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Your dedicated phone number and email sending credentials
        </p>
      </div>

      {/* ── SMS SECTION ─────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6366F118" }}>
            <MessageSquare size={13} style={{ color: "#6366F1" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>SMS — Your Phone Number</h3>
        </div>

        <div className="p-5 space-y-5">
          {/* Current number */}
          {usage?.phoneNumber ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#6366F118" }}>
                <Phone size={18} style={{ color: "#6366F1" }} />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold font-mono" style={{ color: "var(--obs-text)" }}>{usage.phoneNumber}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Your dedicated business number</p>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} style={{ color: "var(--obs-success)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--obs-success)" }}>Active</span>
              </div>
            </div>
          ) : usage?.provisioned ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "#F59E0B08", borderColor: "#F59E0B40" }}>
              <AlertCircle size={15} style={{ color: "#F59E0B" }} />
              <p className="text-sm" style={{ color: "#F59E0B" }}>No phone number yet — search and pick one below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
                <AlertCircle size={15} style={{ color: "var(--obs-muted)" }} />
                <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No SMS account provisioned yet.</p>
              </div>
              <button onClick={handleProvision} disabled={provisioning}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "#6366F1" }}>
                {provisioning ? <><Loader2 size={14} className="animate-spin" /> Setting up…</> : <><Zap size={14} /> Set Up SMS</>}
              </button>
            </div>
          )}

          {/* Usage meter */}
          {usage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 size={13} style={{ color: "var(--obs-muted)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>SMS Usage This Month</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: usageColor }}>
                  {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--obs-elevated)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${usagePct}%`, background: usageColor }} />
              </div>
              <p className="text-[11px]" style={{ color: "var(--obs-muted)" }}>
                {usage.limit - usage.used > 0
                  ? `${(usage.limit - usage.used).toLocaleString()} SMS remaining · resets monthly`
                  : "Limit reached — upgrade to send more"}
              </p>
            </div>
          )}

          {/* Number search */}
          {usage?.provisioned && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>
                {usage.phoneNumber ? "Change Number" : "Pick a Phone Number"}
              </p>
              <div className="flex gap-2">
                <Input value={areaCode} onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="Area code (e.g. 212)" style={{ ...inputStyle, maxWidth: 160 }} />
                <button onClick={handleSearch} disabled={searching}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--obs-accent)" }}>
                  {searching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  {searching ? "Searching…" : "Search"}
                </button>
              </div>

              {availableNumbers.length > 0 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--obs-border)" }}>
                  <div className="grid grid-cols-[1fr_120px_100px] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b"
                    style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)", background: "var(--obs-elevated)" }}>
                    <span>Number</span><span>Location</span><span />
                  </div>
                  {availableNumbers.map((n) => (
                    <div key={n.phoneNumber}
                      className="grid grid-cols-[1fr_120px_100px] gap-3 px-4 py-3 border-b items-center last:border-0"
                      style={{ borderColor: "var(--obs-border)" }}>
                      <span className="text-sm font-mono font-semibold" style={{ color: "var(--obs-text)" }}>{n.friendlyName}</span>
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{n.locality ?? n.region}</span>
                      <button onClick={() => handlePurchase(n.phoneNumber)} disabled={!!purchasing}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                        style={{ background: purchasing === n.phoneNumber ? "var(--obs-muted)" : "#6366F1" }}>
                        {purchasing === n.phoneNumber ? <><Loader2 size={11} className="animate-spin" /> Buying…</> : "Select"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── EMAIL SECTION ─────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#22C55E18" }}>
            <Mail size={13} style={{ color: "#22C55E" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Email — Resend</h3>
          {settings?.resendConfigured && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "#22C55E18", color: "var(--obs-success)" }}>
              Connected
            </span>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1.5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Resend API Key</Label>
            <div className="relative">
              <Input type={showResend ? "text" : "password"} value={form.resendApiKey}
                onChange={(e) => setForm((p) => ({ ...p, resendApiKey: e.target.value }))}
                placeholder={settings?.resendConfigured ? "••••••••••••••••••" : "re_xxxxxxxxxxxx"} style={inputStyle} />
              <button onClick={() => setShowResend(!showResend)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--obs-muted)" }}>
                {showResend ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Email</Label>
              <Input value={form.fromEmail} onChange={(e) => setForm((p) => ({ ...p, fromEmail: e.target.value }))} placeholder="hello@yourdomain.com" style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Name</Label>
              <Input value={form.fromName} onChange={(e) => setForm((p) => ({ ...p, fromName: e.target.value }))} placeholder="Your Business Name" style={inputStyle} />
            </div>
          </div>
          <p className="text-[11px]" style={{ color: "var(--obs-muted)" }}>
            Get your free API key at resend.com · 3,000 emails/month free
          </p>
        </div>
      </div>

      {/* ── MISSED CALL TEXT-BACK ─────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EC489918" }}>
            <PhoneMissed size={13} style={{ color: "#EC4899" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Missed Call Text-Back</h3>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Auto-SMS anyone who calls your number when you don't answer</p>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, missedCallTextBack: !p.missedCallTextBack }))}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
            style={{ background: form.missedCallTextBack ? "#EC4899" : "var(--obs-elevated)" }}>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: form.missedCallTextBack ? "translateX(16px)" : "translateX(0)" }} />
          </button>
        </div>
        {form.missedCallTextBack && (
          <div className="p-5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Auto-reply message</Label>
            <textarea value={form.missedCallMessage}
              onChange={(e) => setForm((p) => ({ ...p, missedCallMessage: e.target.value }))}
              placeholder={`Hi! You just called ${settings ? "us" : "[Business Name]"}. We missed you — how can we help? Reply and we'll get back to you right away!`}
              rows={3} className="w-full mt-1.5 px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={inputStyle} />
          </div>
        )}
      </div>

      {/* ── AI AUTO-REPLY ─────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#818CF818" }}>
            <Bot size={13} style={{ color: "#818CF8" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>AI Auto-Reply to SMS</h3>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Claude AI responds to inbound texts using contact context</p>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, aiAutoReply: !p.aiAutoReply }))}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
            style={{ background: form.aiAutoReply ? "#818CF8" : "var(--obs-elevated)" }}>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: form.aiAutoReply ? "translateX(16px)" : "translateX(0)" }} />
          </button>
        </div>
        {form.aiAutoReply && (
          <div className="p-5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Custom AI instructions (optional)</Label>
            <textarea value={form.aiAutoReplyPrompt}
              onChange={(e) => setForm((p) => ({ ...p, aiAutoReplyPrompt: e.target.value }))}
              placeholder="You are a friendly assistant for [Business]. Keep replies under 160 characters. Always offer to schedule a call if the question is complex."
              rows={3} className="w-full mt-1.5 px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={inputStyle} />
            <p className="text-xs mt-1.5" style={{ color: "var(--obs-muted)" }}>Contact info (name, status, company) is automatically included as context.</p>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--obs-accent)" }}>
        {saving ? "Saving…" : <><Save size={14} /> Save Settings</>}
      </button>
    </div>
  );
}
