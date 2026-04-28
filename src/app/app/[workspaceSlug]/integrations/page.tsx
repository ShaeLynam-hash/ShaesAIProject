"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: string | null;
  syncCount: number;
  config: Record<string, any> | null;
  errorMsg: string | null;
  createdAt: string;
}

// ── Inline style constants ───────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh",
    background: "#08080A",
    color: "#fff",
    padding: "32px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  h1: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px 0",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: "0 0 36px 0",
  } as React.CSSProperties,
  section: {
    marginBottom: "40px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: "14px",
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "14px",
  } as React.CSSProperties,
  card: {
    background: "#111114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  } as React.CSSProperties,
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  } as React.CSSProperties,
  iconWrap: (bg: string) => ({
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "22px",
    background: bg,
  }) as React.CSSProperties,
  cardInfo: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginBottom: "4px",
  } as React.CSSProperties,
  cardName: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    margin: 0,
  } as React.CSSProperties,
  cardDesc: {
    fontSize: "13px",
    color: "#6B7280",
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
  badge: {
    connected: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "2px 9px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      background: "rgba(16,185,129,0.12)",
      color: "#10B981",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    disconnected: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "2px 9px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      background: "rgba(107,114,128,0.12)",
      color: "#6B7280",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    error: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "2px 9px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      background: "rgba(239,68,68,0.12)",
      color: "#EF4444",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    coming_soon: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "2px 9px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      background: "rgba(245,158,11,0.12)",
      color: "#F59E0B",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
  },
  meta: {
    fontSize: "12px",
    color: "#4B5563",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
  } as React.CSSProperties,
  metaHighlight: {
    color: "#10B981",
    fontWeight: 500,
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  btnPrimary: {
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "#fff",
    color: "#08080A",
    border: "none",
  } as React.CSSProperties,
  btnAmber: {
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "#F59E0B",
    color: "#08080A",
    border: "none",
  } as React.CSSProperties,
  btnDanger: {
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(239,68,68,0.1)",
    color: "#EF4444",
    border: "1px solid rgba(239,68,68,0.2)",
  } as React.CSSProperties,
  btnGhost: {
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(255,255,255,0.05)",
    color: "#9CA3AF",
    border: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  } as React.CSSProperties,
  modal: {
    background: "#111114",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "480px",
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 20px 0",
  } as React.CSSProperties,
  formGroup: {
    marginBottom: "14px",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "#9CA3AF",
    marginBottom: "5px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "9px 12px",
    background: "#1A1A1E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "22px",
  } as React.CSSProperties,
  hint: {
    fontSize: "12px",
    color: "#4B5563",
    lineHeight: 1.5,
    marginTop: "6px",
  } as React.CSSProperties,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWorkspaceSlug(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

function formatDate(d: string | null): string {
  if (!d) return "Never";
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// ── Modals ───────────────────────────────────────────────────────────────────

function GHLModal({ onClose, onSuccess, workspaceSlug }: { onClose: () => void; onSuccess: () => void; workspaceSlug: string }) {
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) { toast.error("API key is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/gohighlevel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, apiKey: apiKey.trim(), locationId: locationId.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Connection failed"); return; }
      toast.success("GoHighLevel connected!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <p style={S.modalTitle}>Connect GoHighLevel</p>
        <div style={S.formGroup}>
          <label style={S.label}>API Key *</label>
          <input style={S.input} type="password" placeholder="Your GHL API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Location ID (optional)</label>
          <input style={S.input} type="text" placeholder="Location ID to scope the sync" value={locationId} onChange={(e) => setLocationId(e.target.value)} />
        </div>
        <p style={S.hint}>Find your API key in GHL → Settings → API Keys. The location ID scopes which sub-account contacts to sync.</p>
        <div style={S.modalActions}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? "Connecting..." : "Connect"}</button>
        </div>
      </div>
    </div>
  );
}

function SmtpModal({ onClose, onSuccess, workspaceSlug }: { onClose: () => void; onSuccess: () => void; workspaceSlug: string }) {
  const [form, setForm] = useState({ host: "", port: "587", username: "", password: "", fromEmail: "", fromName: "", secure: false });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.host || !form.port || !form.username || !form.password || !form.fromEmail) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/smtp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save SMTP"); return; }
      toast.success("SMTP configured!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <p style={S.modalTitle}>Configure Custom SMTP</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: "12px" }}>
          <div style={S.formGroup}>
            <label style={S.label}>SMTP Host *</label>
            <input style={S.input} type="text" placeholder="smtp.mailgun.org" value={form.host} onChange={(e) => set("host", e.target.value)} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Port *</label>
            <input style={S.input} type="number" placeholder="587" value={form.port} onChange={(e) => set("port", e.target.value)} />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Username *</label>
          <input style={S.input} type="text" placeholder="SMTP username or email" value={form.username} onChange={(e) => set("username", e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Password *</label>
          <input style={S.input} type="password" placeholder="SMTP password or app password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>From Email *</label>
          <input style={S.input} type="email" placeholder="hello@yourdomain.com" value={form.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>From Name</label>
          <input style={S.input} type="text" placeholder="Your Company" value={form.fromName} onChange={(e) => set("fromName", e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="smtp-secure"
            checked={form.secure}
            onChange={(e) => set("secure", e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#F59E0B" }}
          />
          <label htmlFor="smtp-secure" style={{ fontSize: "13px", color: "#9CA3AF", cursor: "pointer" }}>Use SSL/TLS (port 465)</label>
        </div>
        <div style={S.modalActions}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Configuration"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Integration Card ─────────────────────────────────────────────────────────

interface CardProps {
  icon: string;
  iconBg: string;
  name: string;
  description: string;
  integration: Integration | undefined;
  comingSoon?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  syncing?: boolean;
  connectLabel?: string;
  extraMeta?: React.ReactNode;
}

function IntegrationCard({
  icon, iconBg, name, description, integration, comingSoon,
  onConnect, onDisconnect, onSync, syncing, connectLabel = "Connect", extraMeta,
}: CardProps) {
  const isConnected = !!integration && integration.status === "active";
  const hasError = !!integration && integration.status === "error";

  let badgeStyle = S.badge.disconnected;
  let badgeLabel = "Not Connected";
  let badgeDot = false;

  if (comingSoon) { badgeStyle = S.badge.coming_soon; badgeLabel = "Coming Soon"; }
  else if (isConnected) { badgeStyle = S.badge.connected; badgeLabel = "Connected"; badgeDot = true; }
  else if (hasError) { badgeStyle = S.badge.error; badgeLabel = "Error"; }

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div style={S.iconWrap(iconBg)}>{icon}</div>
        <div style={S.cardInfo}>
          <div style={S.nameRow}>
            <p style={S.cardName}>{name}</p>
            <span style={badgeStyle}>
              {badgeDot && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />}
              {badgeLabel}
            </span>
          </div>
          <p style={S.cardDesc}>{description}</p>
        </div>
      </div>

      {integration && (
        <div style={S.meta}>
          {extraMeta}
          {integration.lastSyncAt && <span>Last synced: {formatDate(integration.lastSyncAt)}</span>}
          {integration.syncCount > 0 && <span>{integration.syncCount.toLocaleString()} records synced</span>}
          {integration.errorMsg && <span style={{ color: "#EF4444" }}>{integration.errorMsg}</span>}
        </div>
      )}

      {!comingSoon && (
        <div style={S.actions}>
          {!isConnected && !hasError && (
            <button style={S.btnPrimary} onClick={onConnect}>{connectLabel}</button>
          )}
          {(isConnected || hasError) && (
            <>
              {onSync && (
                <button style={S.btnAmber} onClick={onSync} disabled={syncing}>
                  {syncing ? "Syncing..." : "Sync Now"}
                </button>
              )}
              <button style={S.btnGhost} onClick={onConnect}>Reconfigure</button>
              <button style={S.btnDanger} onClick={onDisconnect}>Disconnect</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"ghl" | "smtp" | null>(null);
  const [syncingGHL, setSyncingGHL] = useState(false);
  const [syncingQB, setSyncingQB] = useState(false);

  useEffect(() => {
    setWorkspaceSlug(getWorkspaceSlug());
  }, []);

  const fetchIntegrations = useCallback(async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/status?workspace=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workspaceSlug) fetchIntegrations(workspaceSlug);
  }, [workspaceSlug, fetchIntegrations]);

  // Handle redirect params from OAuth callbacks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected === "quickbooks") toast.success("QuickBooks connected successfully!");
    if (connected === "gmail") toast.success("Gmail connected successfully!");
    if (error === "qb_token") toast.error("QuickBooks token exchange failed. Please try again.");
    if (error === "qb_callback") toast.error("QuickBooks OAuth callback error.");
    if (error === "gmail_token") toast.error("Gmail token exchange failed. Please try again.");
    if (error === "gmail_callback") toast.error("Gmail OAuth callback error.");
    if (connected || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const getInt = (provider: string) => integrations.find((i) => i.provider === provider);

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Disconnect ${provider}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/integrations/${provider}/disconnect?workspace=${workspaceSlug}`, { method: "DELETE" });
      if (res.ok) { toast.success("Disconnected"); fetchIntegrations(workspaceSlug); }
      else toast.error("Failed to disconnect");
    } catch { toast.error("Network error"); }
  };

  const handleGHLSync = async () => {
    setSyncingGHL(true);
    try {
      const res = await fetch("/api/integrations/gohighlevel/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(`Synced ${data.imported} contacts from GoHighLevel`); fetchIntegrations(workspaceSlug); }
      else toast.error(data.error ?? "Sync failed");
    } catch { toast.error("Network error"); }
    finally { setSyncingGHL(false); }
  };

  const handleQBSync = async () => {
    setSyncingQB(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced ${data.invoicesImported} invoices + ${data.expensesImported} expenses from QuickBooks`);
        fetchIntegrations(workspaceSlug);
      } else toast.error(data.error ?? "Sync failed");
    } catch { toast.error("Network error"); }
    finally { setSyncingQB(false); }
  };

  const gmailInt = getInt("gmail");
  const gmailEmail = (gmailInt?.config as any)?.email;
  const smtpInt = getInt("smtp");
  const smtpHost = (smtpInt?.config as any)?.host;
  const smtpPort = (smtpInt?.config as any)?.port;
  const qbInt = getInt("quickbooks");
  const qbRealmId = (qbInt?.config as any)?.realmId;

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "240px", color: "#6B7280", fontSize: "14px" }}>
          Loading integrations...
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Integrations</h1>
      <p style={S.subtitle}>Connect your tools to sync data and automate workflows across your workspace</p>

      {/* ── Email Setup ── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Email Setup</p>
        <div style={S.grid}>

          <IntegrationCard
            icon="📧"
            iconBg="rgba(234,88,12,0.15)"
            name="Gmail"
            description="Connect your Google account to send emails directly through your Gmail address. Best deliverability — emails come from your real inbox."
            integration={gmailInt}
            connectLabel="Connect Gmail"
            onConnect={() => { window.location.href = `/api/integrations/gmail/connect?workspace=${workspaceSlug}`; }}
            onDisconnect={() => handleDisconnect("gmail")}
            extraMeta={gmailEmail ? <span style={S.metaHighlight}>✓ {gmailEmail}</span> : undefined}
          />

          <IntegrationCard
            icon="📮"
            iconBg="rgba(99,102,241,0.15)"
            name="Custom SMTP"
            description="Use your own SMTP server — Mailgun, SendGrid, Postmark, AWS SES, or any other provider — for full control over email delivery."
            integration={smtpInt}
            connectLabel="Configure SMTP"
            onConnect={() => setModal("smtp")}
            onDisconnect={() => handleDisconnect("smtp")}
            extraMeta={smtpInt ? <span style={S.metaHighlight}>✓ {smtpHost}:{smtpPort}</span> : undefined}
          />

        </div>
      </div>

      {/* ── CRM & Sales ── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>CRM & Sales</p>
        <div style={S.grid}>

          <IntegrationCard
            icon="🚀"
            iconBg="rgba(245,158,11,0.15)"
            name="GoHighLevel"
            description="Sync contacts and leads from your GoHighLevel account. Contacts are upserted into your CRM on every sync, preserving tags and metadata."
            integration={getInt("gohighlevel")}
            connectLabel="Connect GHL"
            onConnect={() => setModal("ghl")}
            onDisconnect={() => handleDisconnect("gohighlevel")}
            onSync={handleGHLSync}
            syncing={syncingGHL}
          />

        </div>
      </div>

      {/* ── Accounting ── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Accounting</p>
        <div style={S.grid}>

          <IntegrationCard
            icon="📊"
            iconBg="rgba(34,197,94,0.15)"
            name="QuickBooks Online"
            description="Sync invoices and expenses from QuickBooks via secure OAuth2. No passwords stored — connect with your Intuit account."
            integration={qbInt}
            connectLabel="Connect QuickBooks"
            onConnect={() => { window.location.href = `/api/integrations/quickbooks/connect?workspace=${workspaceSlug}`; }}
            onDisconnect={() => handleDisconnect("quickbooks")}
            onSync={handleQBSync}
            syncing={syncingQB}
            extraMeta={qbRealmId ? <span style={S.metaHighlight}>✓ Company ID: {qbRealmId}</span> : undefined}
          />

          <IntegrationCard
            icon="💼"
            iconBg="rgba(59,130,246,0.15)"
            name="Xero"
            description="Sync bills, invoices, and bank transactions from Xero accounting software. OAuth2 connection coming soon."
            integration={undefined}
            comingSoon
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

        </div>
      </div>

      {/* ── Coming Soon ── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Coming Soon</p>
        <div style={S.grid}>

          <IntegrationCard
            icon="⚡"
            iconBg="rgba(245,158,11,0.10)"
            name="Zapier"
            description="Connect your workspace to 5,000+ apps via Zapier automation. Trigger workflows on any event."
            integration={undefined}
            comingSoon
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

          <IntegrationCard
            icon="📬"
            iconBg="rgba(0,120,212,0.10)"
            name="Outlook / Microsoft 365"
            description="Send emails directly from your Microsoft Outlook or Microsoft 365 account via OAuth2."
            integration={undefined}
            comingSoon
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

          <IntegrationCard
            icon="🟠"
            iconBg="rgba(234,88,12,0.10)"
            name="HubSpot"
            description="Two-way sync of contacts, deals, companies, and activities with HubSpot CRM."
            integration={undefined}
            comingSoon
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

          <IntegrationCard
            icon="☁️"
            iconBg="rgba(0,161,224,0.10)"
            name="Salesforce"
            description="Enterprise-grade sync with Salesforce — leads, opportunities, accounts, and custom objects."
            integration={undefined}
            comingSoon
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

        </div>
      </div>

      {/* ── Modals ── */}
      {modal === "ghl" && (
        <GHLModal
          workspaceSlug={workspaceSlug}
          onClose={() => setModal(null)}
          onSuccess={() => fetchIntegrations(workspaceSlug)}
        />
      )}
      {modal === "smtp" && (
        <SmtpModal
          workspaceSlug={workspaceSlug}
          onClose={() => setModal(null)}
          onSuccess={() => fetchIntegrations(workspaceSlug)}
        />
      )}
    </div>
  );
}
