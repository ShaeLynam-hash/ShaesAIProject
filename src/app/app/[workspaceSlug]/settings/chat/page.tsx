"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, MessageCircle } from "lucide-react";

interface WidgetConfig {
  enabled: boolean;
  widgetColor: string;
  welcomeMessage: string;
  teamName: string;
  teamAvatar?: string;
  aiEnabled: boolean;
  aiPrompt?: string;
}

export default function ChatSettingsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [config, setConfig] = useState<WidgetConfig>({
    enabled: true, widgetColor: "#F59E0B", welcomeMessage: "Hi! How can we help you today?",
    teamName: "Support", aiEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchConfig = useCallback(async () => {
    const res = await fetch(`/api/chat/widget/settings?workspace=${workspaceSlug}`);
    const data = await res.json();
    if (data.widget) setConfig(data.widget);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/chat/widget/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...config }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const scriptTag = `<script src="${typeof window !== "undefined" ? window.location.origin : "https://stactoro.app"}/api/chat/widget-script?workspace=${workspaceSlug}" async></script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--obs-border)", background: "var(--obs-bg)", color: "var(--obs-text)", fontSize: 13, boxSizing: "border-box" as const };

  if (loading) return <p style={{ color: "var(--obs-muted)", fontSize: 14 }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--obs-text)", marginBottom: 24 }}>Live Chat Widget</h2>

      {/* Enable toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: 12, border: "1px solid var(--obs-border)", background: "var(--obs-surface)", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--obs-text)" }}>Enable Widget</p>
          <p style={{ fontSize: 12, color: "var(--obs-muted)", marginTop: 2 }}>Show the chat bubble on your embed pages</p>
        </div>
        <button onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
          style={{ position: "relative", width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: config.enabled ? "var(--obs-accent)" : "var(--obs-border)", transition: "background .2s" }}>
          <span style={{ position: "absolute", top: 2, transition: "left .2s", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", left: config.enabled ? "calc(100% - 22px)" : "2px" }} />
        </button>
      </div>

      {/* Appearance */}
      <div style={{ padding: 20, borderRadius: 12, border: "1px solid var(--obs-border)", background: "var(--obs-surface)", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)", marginBottom: 16 }}>Appearance</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 6, textTransform: "uppercase" }}>Widget Color</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="color" value={config.widgetColor} onChange={e => setConfig(c => ({ ...c, widgetColor: e.target.value }))} style={{ width: 40, height: 40, borderRadius: 8, cursor: "pointer", border: "1px solid var(--obs-border)" }} />
            <input value={config.widgetColor} onChange={e => setConfig(c => ({ ...c, widgetColor: e.target.value }))} style={{ ...inp, flex: 1, fontFamily: "monospace" }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 6, textTransform: "uppercase" }}>Team Name</label>
          <input value={config.teamName} onChange={e => setConfig(c => ({ ...c, teamName: e.target.value }))} style={inp} placeholder="Support" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 6, textTransform: "uppercase" }}>Welcome Message</label>
          <textarea value={config.welcomeMessage} onChange={e => setConfig(c => ({ ...c, welcomeMessage: e.target.value }))} rows={2}
            style={{ ...inp, resize: "vertical" }} placeholder="Hi! How can we help you today?" />
        </div>
      </div>

      {/* AI Auto-Reply */}
      <div style={{ padding: 20, borderRadius: 12, border: "1px solid var(--obs-border)", background: "var(--obs-surface)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)" }}>AI Auto-Reply</p>
            <p style={{ fontSize: 12, color: "var(--obs-muted)", marginTop: 2 }}>Claude auto-responds to visitor messages</p>
          </div>
          <button onClick={() => setConfig(c => ({ ...c, aiEnabled: !c.aiEnabled }))}
            style={{ position: "relative", width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: config.aiEnabled ? "#8B5CF6" : "var(--obs-border)", transition: "background .2s" }}>
            <span style={{ position: "absolute", top: 2, transition: "left .2s", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", left: config.aiEnabled ? "calc(100% - 22px)" : "2px" }} />
          </button>
        </div>
        {config.aiEnabled && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 6, textTransform: "uppercase" }}>AI Instructions</label>
            <textarea value={config.aiPrompt ?? ""} onChange={e => setConfig(c => ({ ...c, aiPrompt: e.target.value }))} rows={4}
              style={{ ...inp, resize: "vertical" }} placeholder="You are a helpful support agent for [Your Business]. Be friendly and concise. Help customers with questions about our products and services..." />
          </div>
        )}
      </div>

      {/* Embed Code */}
      <div style={{ padding: 20, borderRadius: 12, border: "1px solid var(--obs-border)", background: "var(--obs-surface)", marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)", marginBottom: 4 }}>Embed Code</p>
        <p style={{ fontSize: 12, color: "var(--obs-muted)", marginBottom: 12 }}>Paste this snippet before the closing &lt;/body&gt; tag of any website.</p>
        <div style={{ position: "relative" }}>
          <pre style={{ background: "var(--obs-bg)", borderRadius: 8, padding: "12px 14px", fontSize: 12, fontFamily: "monospace", color: "var(--obs-text)", border: "1px solid var(--obs-border)", overflowX: "auto", paddingRight: 48, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {scriptTag}
          </pre>
          <button onClick={copyScript} style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", borderRadius: 6, background: "var(--obs-elevated)", border: "1px solid var(--obs-border)", cursor: "pointer", color: "var(--obs-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            {copied ? <Check size={12} style={{ color: "#10B981" }} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div style={{ padding: 20, borderRadius: 12, border: "1px solid var(--obs-border)", background: "var(--obs-surface)", marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)", marginBottom: 12 }}>Widget Preview</p>
        <div style={{ position: "relative", height: 80, background: "var(--obs-elevated)", borderRadius: 10 }}>
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 48, height: 48, borderRadius: "50%", background: config.widgetColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            <MessageCircle size={22} style={{ color: "#fff" }} />
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: "11px 28px", borderRadius: 10, background: "var(--obs-accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
