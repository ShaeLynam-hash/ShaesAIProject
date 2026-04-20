"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Building2, Plus, Settings, ExternalLink, Users, Contact2, ChevronRight, Globe, Palette, Mail, Eye, EyeOff, Copy, Check } from "lucide-react";

interface Client {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: string;
  status: string;
  memberCount: number;
  contactCount: number;
  createdAt: string;
}

interface WhiteLabel {
  isAgency: boolean;
  wlBrandName?: string;
  wlLogoUrl?: string;
  wlPrimaryColor?: string;
  wlSupportEmail?: string;
  wlCustomDomain?: string;
  wlHideAttribution?: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "var(--obs-muted)",
  STARTER: "#3B82F6",
  PRO: "#8B5CF6",
  AGENCY: "#F59E0B",
  ENTERPRISE: "#10B981",
};

export default function AgencyPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [tab, setTab] = useState<"clients" | "branding">("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [wl, setWl] = useState<WhiteLabel>({ isAgency: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [wlRes, clientsRes] = await Promise.all([
      fetch(`/api/agency/white-label?workspace=${workspaceSlug}`),
      fetch(`/api/agency/clients?workspace=${workspaceSlug}`),
    ]);
    const wlData = await wlRes.json();
    setWl(wlData.whiteLabel ?? { isAgency: false });
    if (clientsRes.ok) {
      const cd = await clientsRes.json();
      setClients(cd.clients ?? []);
    }
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveWl = async () => {
    setSaving(true);
    await fetch("/api/agency/white-label", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...wl }),
    });
    setSaving(false);
    // Re-fetch to sync
    fetchData();
  };

  const createClient = async () => {
    if (!newClientName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/agency/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agencySlug: workspaceSlug, clientName: newClientName, clientEmail: newClientEmail }),
    });
    setCreating(false);
    if (res.ok) {
      setShowCreate(false);
      setNewClientName("");
      setNewClientEmail("");
      fetchData();
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/app/${slug}/dashboard`);
    setCopied(slug);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) return <div style={{ color: "var(--obs-muted)", padding: 24, fontSize: 14 }}>Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Agency & White-Label</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Manage client workspaces and customize your brand</p>
        </div>
        {tab === "clients" && wl.isAgency && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--obs-accent)", color: "#fff" }}>
            <Plus size={14} /> Add Client
          </button>
        )}
      </div>

      {/* Agency toggle banner */}
      {!wl.isAgency && (
        <div className="rounded-xl p-5 border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#F59E0B22" }}>
              <Building2 size={22} style={{ color: "#F59E0B" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--obs-text)" }}>Enable Agency Mode</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>Create and manage client workspaces, apply custom branding, and resell Stactoro under your own brand.</p>
            </div>
            <button
              onClick={() => { setWl(w => ({ ...w, isAgency: true })); }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "#F59E0B", color: "#fff" }}
            >Enable</button>
          </div>
        </div>
      )}

      {wl.isAgency && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b" style={{ borderColor: "var(--obs-border)" }}>
            {(["clients", "branding"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors capitalize"
                style={{ borderColor: tab === t ? "var(--obs-accent)" : "transparent", color: tab === t ? "var(--obs-accent)" : "var(--obs-muted)" }}>
                {t === "clients" ? "Client Workspaces" : "Branding"}
              </button>
            ))}
          </div>

          {/* CLIENTS TAB */}
          {tab === "clients" && (
            <div className="space-y-3">
              {clients.length === 0 ? (
                <div className="rounded-xl border p-10 text-center" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
                  <Building2 size={32} style={{ color: "var(--obs-muted)", margin: "0 auto 12px" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No clients yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Add your first client workspace to get started.</p>
                  <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--obs-accent)", color: "#fff" }}>
                    <Plus size={12} className="inline mr-1" />Add Client
                  </button>
                </div>
              ) : (
                clients.map((c) => (
                  <div key={c.id} className="rounded-xl border p-4 flex items-center gap-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--obs-elevated)" }}>
                      {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Building2 size={18} style={{ color: "var(--obs-muted)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: "var(--obs-text)" }}>{c.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: PLAN_COLORS[c.plan] + "22", color: PLAN_COLORS[c.plan] }}>{c.plan}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--obs-muted)" }}><Users size={11} />{c.memberCount} members</span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--obs-muted)" }}><Contact2 size={11} />{c.contactCount} contacts</span>
                        <span className="text-xs" style={{ color: "var(--obs-muted)" }}>/{c.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyLink(c.slug)} className="p-2 rounded-lg transition-colors" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }} title="Copy link">
                        {copied === c.slug ? <Check size={14} style={{ color: "#10B981" }} /> : <Copy size={14} />}
                      </button>
                      <a href={`/app/${c.slug}/dashboard`} target="_blank" rel="noreferrer" className="p-2 rounded-lg transition-colors" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }} title="Open workspace">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BRANDING TAB */}
          {tab === "branding" && (
            <div className="space-y-5 max-w-lg">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Brand Name</label>
                <input value={wl.wlBrandName ?? ""} onChange={(e) => setWl(w => ({ ...w, wlBrandName: e.target.value }))}
                  placeholder="Your Agency Name" className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Shown to clients instead of "Stactoro"</p>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Logo URL</label>
                <input value={wl.wlLogoUrl ?? ""} onChange={(e) => setWl(w => ({ ...w, wlLogoUrl: e.target.value }))}
                  placeholder="https://youragency.com/logo.png" className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                {wl.wlLogoUrl && <img src={wl.wlLogoUrl} alt="Logo preview" className="mt-2 h-10 object-contain rounded" />}
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={wl.wlPrimaryColor ?? "#F59E0B"}
                    onChange={(e) => setWl(w => ({ ...w, wlPrimaryColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0" style={{ background: "none" }} />
                  <input value={wl.wlPrimaryColor ?? "#F59E0B"} onChange={(e) => setWl(w => ({ ...w, wlPrimaryColor: e.target.value }))}
                    placeholder="#F59E0B" className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                    style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                </div>
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Support Email</label>
                <input value={wl.wlSupportEmail ?? ""} onChange={(e) => setWl(w => ({ ...w, wlSupportEmail: e.target.value }))}
                  placeholder="support@youragency.com" type="email" className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>

              {/* Custom Domain */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>
                  <Globe size={12} className="inline mr-1" />Custom Domain
                </label>
                <input value={wl.wlCustomDomain ?? ""} onChange={(e) => setWl(w => ({ ...w, wlCustomDomain: e.target.value }))}
                  placeholder="app.youragency.com" className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Point your CNAME to <span className="font-mono" style={{ color: "var(--obs-text)" }}>cname.stactoro.app</span> then enter your domain here.</p>
              </div>

              {/* Hide Attribution */}
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>Hide "Powered by Stactoro"</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>Remove Stactoro branding from client-facing pages</p>
                </div>
                <button onClick={() => setWl(w => ({ ...w, wlHideAttribution: !w.wlHideAttribution }))}
                  className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: wl.wlHideAttribution ? "var(--obs-accent)" : "var(--obs-border)" }}>
                  <span className="absolute top-0.5 transition-all w-5 h-5 rounded-full bg-white shadow"
                    style={{ left: wl.wlHideAttribution ? "calc(100% - 22px)" : "2px" }} />
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--obs-border)" }}>
                <div className="px-4 py-2.5 border-b text-xs font-medium flex items-center gap-2" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                  <Eye size={12} /> Branding Preview
                </div>
                <div className="p-4" style={{ background: "var(--obs-surface)" }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    {wl.wlLogoUrl ? (
                      <img src={wl.wlLogoUrl} alt="" className="h-7 object-contain" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: wl.wlPrimaryColor ?? "#F59E0B" }}>
                        {(wl.wlBrandName ?? "L")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-sm" style={{ color: "var(--obs-text)" }}>{wl.wlBrandName ?? "Stactoro"}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: wl.wlPrimaryColor ?? "#F59E0B" }}>Primary Button</div>
                    <div className="px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: wl.wlPrimaryColor ?? "#F59E0B", color: wl.wlPrimaryColor ?? "#F59E0B" }}>Outline</div>
                  </div>
                  {!wl.wlHideAttribution && (
                    <p className="text-xs mt-3" style={{ color: "var(--obs-muted)" }}>Powered by Stactoro</p>
                  )}
                </div>
              </div>

              <button onClick={saveWl} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--obs-accent)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Branding"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Client Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" style={{ background: "var(--obs-surface)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>Add Client Workspace</h2>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Client / Business Name *</label>
              <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Acme Corp" className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--obs-text)" }}>Client Contact Email (optional)</label>
              <input value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="owner@acme.com" type="email" className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>Cancel</button>
              <button onClick={createClient} disabled={creating || !newClientName.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--obs-accent)", color: "#fff", opacity: creating ? 0.7 : 1 }}>
                {creating ? "Creating…" : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
