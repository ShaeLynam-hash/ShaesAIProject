"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Integration {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: string | null;
  syncCount: number;
  config: Record<string, any> | null;
  errorMsg: string | null;
}

function getSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

// ── SMTP Modal ────────────────────────────────────────────────────────────────
function SmtpModal({ onClose, onSaved, slug }: { onClose: () => void; onSaved: () => void; slug: string }) {
  const [f, setF] = useState({ host: "", port: "587", username: "", password: "", fromEmail: "", fromName: "", secure: false });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.host || !f.port || !f.username || !f.password || !f.fromEmail) {
      toast.error("Please fill in all required fields"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/smtp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: slug, ...f }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save"); return; }
      toast.success("Email connected!");
      onSaved(); onClose();
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: "#0E0E11",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Connect Your Email</p>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 22px" }}>Emails and campaigns will send from your own address.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10, marginBottom: 12 }}>
          <div><label style={lbl}>SMTP Host *</label><input style={inp} placeholder="smtp.zoho.com" value={f.host} onChange={e => set("host", e.target.value)} /></div>
          <div><label style={lbl}>Port *</label><input style={inp} type="number" placeholder="587" value={f.port} onChange={e => set("port", e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Username *</label>
          <input style={inp} placeholder="your@email.com" value={f.username} onChange={e => set("username", e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Password / App Password *</label>
          <input style={inp} type="password" placeholder="••••••••" value={f.password} onChange={e => set("password", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div><label style={lbl}>From Email *</label><input style={inp} type="email" placeholder="hello@yourdomain.com" value={f.fromEmail} onChange={e => set("fromEmail", e.target.value)} /></div>
          <div><label style={lbl}>Display Name</label><input style={inp} placeholder="Your Business" value={f.fromName} onChange={e => set("fromName", e.target.value)} /></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, cursor: "pointer", fontSize: 13, color: "#9CA3AF" }}>
          <input type="checkbox" checked={f.secure} onChange={e => set("secure", e.target.checked)} style={{ width: 15, height: 15, accentColor: "#F59E0B" }} />
          Use SSL/TLS (port 465)
        </label>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, background: "#F59E0B", color: "#000", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.7 : 1 }}>{saving ? "Connecting…" : "Connect Email"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Import Modal (GHL contacts or QB data) ────────────────────────────────────
function ImportModal({ provider, onClose, onDone, slug }: { provider: "gohighlevel" | "quickbooks"; onClose: () => void; onDone: () => void; slug: string }) {
  const isGHL = provider === "gohighlevel";
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<{ contacts?: number; invoices?: number; expenses?: number } | null>(null);

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: "#0E0E11",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  async function runImport() {
    if (!apiKey.trim()) { toast.error("API key is required"); return; }
    setRunning(true);
    try {
      // Connect first
      const connectRes = await fetch(`/api/integrations/${provider}/connect`, {
        method: isGHL ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        ...(isGHL ? { body: JSON.stringify({ workspaceSlug: slug, apiKey: apiKey.trim(), locationId: locationId.trim() || undefined }) } : {}),
      });
      if (!connectRes.ok) {
        const d = await connectRes.json().catch(() => ({}));
        toast.error(d.error ?? "Invalid credentials"); setRunning(false); return;
      }
      // Sync
      const syncRes = await fetch(`/api/integrations/${provider}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: slug }),
      });
      const syncData = await syncRes.json();
      if (syncRes.ok) {
        setDone(isGHL ? { contacts: syncData.imported } : { invoices: syncData.invoicesImported, expenses: syncData.expensesImported });
        onDone();
      } else {
        toast.error(syncData.error ?? "Import failed");
      }
    } catch { toast.error("Network error"); }
    finally { setRunning(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Import Complete!</p>
            {done.contacts !== undefined && <p style={{ fontSize: 14, color: "#10B981" }}>{done.contacts} contacts imported into your CRM</p>}
            {done.invoices !== undefined && <p style={{ fontSize: 14, color: "#10B981" }}>{done.invoices} invoices + {done.expenses} expenses imported</p>}
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 10 }}>You can now disconnect this import — all your data is in Stactoro.</p>
            <button onClick={onClose} style={{ marginTop: 20, padding: "9px 24px", borderRadius: 8, background: "#F59E0B", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" }}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
              Import from {isGHL ? "GoHighLevel" : "QuickBooks"}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 22px" }}>
              {isGHL
                ? "This is a one-time import. Your contacts will be added to your Stactoro CRM — you won't need GHL after this."
                : "One-time import of your invoices and expenses into Stactoro's ledger. You won't need QuickBooks after this."}
            </p>

            {isGHL ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>GoHighLevel API Key *</label>
                  <input style={inp} type="password" placeholder="Paste your GHL API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  <p style={{ fontSize: 12, color: "#4B5563", marginTop: 5 }}>Find it in GHL → Settings → Integrations → API Key</p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Location ID (optional)</label>
                  <input style={inp} placeholder="Only needed for agency accounts" value={locationId} onChange={e => setLocationId(e.target.value)} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, marginBottom: 4 }}>OAuth Redirect</p>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>Clicking Import will take you to QuickBooks to authorize. No password is stored — just a secure access token.</p>
                <div style={{ marginTop: 10 }}>
                  <label style={lbl}>QuickBooks API Key (if using API)</label>
                  <input style={inp} type="password" placeholder="Optional: paste key if not using OAuth" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={isGHL ? runImport : () => { window.location.href = `/api/integrations/quickbooks/connect?workspace=${slug}`; }}
                disabled={running}
                style={{ padding: "8px 20px", borderRadius: 8, background: "#F59E0B", color: "#000", fontSize: 13, fontWeight: 700, cursor: running ? "not-allowed" : "pointer", border: "none", opacity: running ? 0.7 : 1 }}>
                {running ? "Importing…" : isGHL ? "Import Contacts" : "Connect & Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const [slug, setSlug] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"smtp" | "ghl" | "quickbooks" | null>(null);

  useEffect(() => { setSlug(getSlug()); }, []);

  const load = useCallback(async (s: string) => {
    if (!s) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/status?workspace=${s}`);
      if (res.ok) setIntegrations((await res.json()).integrations ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (slug) load(slug); }, [slug, load]);

  // OAuth callback params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("connected") === "gmail") toast.success("Gmail connected!");
    if (p.get("connected") === "quickbooks") toast.success("QuickBooks data imported!");
    if (p.get("error")) toast.error("Connection failed — please try again.");
    if (p.get("connected") || p.get("error")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("connected"); url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const get = (p: string) => integrations.find(i => i.provider === p);

  async function disconnect(provider: string) {
    if (!confirm(`Remove this connection?`)) return;
    await fetch(`/api/integrations/${provider}/disconnect?workspace=${slug}`, { method: "DELETE" });
    toast.success("Removed"); load(slug);
  }

  const card = (style?: React.CSSProperties): React.CSSProperties => ({
    background: "#111114", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "22px 24px", ...style,
  });

  const gmailInt = get("gmail");
  const smtpInt = get("smtp");
  const emailConnected = !!gmailInt || !!smtpInt;
  const emailLabel = gmailInt ? (gmailInt.config as any)?.email : smtpInt ? (smtpInt.config as any)?.fromEmail : null;

  const ghlInt = get("gohighlevel");
  const qbInt = get("quickbooks");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#4B5563", fontSize: 14 }}>
      Loading…
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F2F2F5", marginBottom: 4 }}>Connections</h1>
      <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 36 }}>Everything you need is already built in. The only external connection you need is email.</p>

      {/* ── Email — the only required external connection ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Email Sending</p>

        <div style={card()}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: emailConnected ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {emailConnected ? "✅" : "📧"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#F2F2F5" }}>Email</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  background: emailConnected ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  color: emailConnected ? "#10B981" : "#F59E0B",
                }}>
                  {emailConnected ? `✓ Connected — ${emailLabel}` : "⚠ Not connected"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                {emailConnected
                  ? "Your campaigns and invoices send from your own address. You're all set."
                  : "Connect your email so campaigns, invoices, and notifications send from your own address — not a generic one."}
              </p>
            </div>
          </div>

          {!emailConnected && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button
                onClick={() => { window.location.href = `/api/integrations/gmail/connect?workspace=${slug}`; }}
                style={{ flex: 1, padding: "10px", borderRadius: 9, background: "#fff", color: "#111", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
                Connect Gmail
              </button>
              <button
                onClick={() => setModal("smtp")}
                style={{ flex: 1, padding: "10px", borderRadius: 9, background: "rgba(255,255,255,0.06)", color: "#D1D5DB", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)" }}>
                Use Another Email Provider
              </button>
            </div>
          )}

          {emailConnected && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => setModal("smtp")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "#9CA3AF", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.07)" }}>Change</button>
              {gmailInt && <button onClick={() => disconnect("gmail")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.15)" }}>Disconnect</button>}
              {smtpInt && <button onClick={() => disconnect("smtp")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.15)" }}>Disconnect</button>}
            </div>
          )}
        </div>
      </div>

      {/* ── Built-in tools (reassurance) ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Already Built In — No External Tools Needed</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { icon: "👥", name: "CRM", sub: "Contacts, deals & pipeline" },
            { icon: "💳", name: "Payments & Invoicing", sub: "Send invoices, track revenue" },
            { icon: "📒", name: "Ledger & Accounting", sub: "P&L, expenses, journal" },
            { icon: "📅", name: "Calendar & Booking", sub: "Appointments & scheduling" },
            { icon: "📢", name: "Email Marketing", sub: "Campaigns & sequences" },
            { icon: "💬", name: "SMS", sub: "Text campaigns & auto-replies" },
            { icon: "📋", name: "Forms & Pipelines", sub: "Lead capture & automation" },
            { icon: "🎫", name: "Support Tickets", sub: "Helpdesk built in" },
            { icon: "📊", name: "Analytics", sub: "Reports & insights" },
          ].map(({ icon, name, sub }) => (
            <div key={name} style={{ padding: "14px 16px", background: "#0E0E11", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#D1D5DB", margin: 0 }}>{name}</p>
                <p style={{ fontSize: 11, color: "#4B5563", margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── One-time data import ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Switching From Another Tool?</p>
        <p style={{ fontSize: 13, color: "#4B5563", marginBottom: 14 }}>Import your existing data in one click. After that, you're done with those tools.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* GHL Import */}
          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🚀</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F5", margin: 0 }}>GoHighLevel</p>
                <p style={{ fontSize: 12, color: ghlInt ? "#10B981" : "#6B7280", margin: 0 }}>
                  {ghlInt ? `✓ ${ghlInt.syncCount.toLocaleString()} contacts imported` : "Import your contacts"}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#4B5563", marginBottom: 14, lineHeight: 1.5 }}>
              Paste your GHL API key and all your contacts, tags, and lead data will import directly into your CRM.
            </p>
            <button
              onClick={() => setModal("ghl")}
              style={{ width: "100%", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: ghlInt ? "rgba(255,255,255,0.05)" : "#F59E0B", color: ghlInt ? "#9CA3AF" : "#000" }}>
              {ghlInt ? "Re-import" : "Import Contacts →"}
            </button>
          </div>

          {/* QB Import */}
          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📊</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F5", margin: 0 }}>QuickBooks</p>
                <p style={{ fontSize: 12, color: qbInt ? "#10B981" : "#6B7280", margin: 0 }}>
                  {qbInt ? `✓ ${qbInt.syncCount.toLocaleString()} records imported` : "Import your financials"}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#4B5563", marginBottom: 14, lineHeight: 1.5 }}>
              Authorize with QuickBooks and your invoices, expenses, and financial history import into your ledger.
            </p>
            <button
              onClick={() => setModal("quickbooks")}
              style={{ width: "100%", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: qbInt ? "rgba(255,255,255,0.05)" : "#F59E0B", color: qbInt ? "#9CA3AF" : "#000" }}>
              {qbInt ? "Re-import" : "Import Financials →"}
            </button>
          </div>

        </div>
      </div>

      {/* Modals */}
      {modal === "smtp" && <SmtpModal slug={slug} onClose={() => setModal(null)} onSaved={() => load(slug)} />}
      {modal === "ghl" && <ImportModal provider="gohighlevel" slug={slug} onClose={() => setModal(null)} onDone={() => load(slug)} />}
      {modal === "quickbooks" && <ImportModal provider="quickbooks" slug={slug} onClose={() => setModal(null)} onDone={() => load(slug)} />}
    </div>
  );
}
