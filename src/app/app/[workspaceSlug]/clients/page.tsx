"use client";
import { useState, useEffect, use } from "react";
import { UserPlus, ExternalLink, Copy, Check, Users } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function ClientsPage({ params }: Props) {
  const { workspaceSlug } = use(params);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const portalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/${workspaceSlug}`
    : `/portal/${workspaceSlug}`;

  useEffect(() => {
    fetch(`/api/portal/${workspaceSlug}/clients`)
      .then((r) => r.json())
      .then((d) => { setClients(d.clients ?? []); setLoading(false); });
  }, [workspaceSlug]);

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/portal/${workspaceSlug}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to create client"); setSaving(false); return; }
    setClients((prev) => [data.client, ...prev]);
    setForm({ name: "", email: "", password: "" });
    setShowForm(false);
    setSaving(false);
  }

  function copyPortalLink(clientEmail: string) {
    navigator.clipboard.writeText(portalUrl);
    setCopiedId(clientEmail);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Client Portal</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            Create accounts so clients can view their invoices and appointments
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black"
          style={{ background: "var(--obs-accent)" }}>
          <UserPlus size={15} /> Add Client
        </button>
      </div>

      {/* Portal link banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Client Portal URL</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--obs-muted)" }}>{portalUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={portalUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: "var(--obs-elevated)", color: "var(--obs-text)" }}>
            <ExternalLink size={12} /> Preview
          </a>
          <button onClick={() => copyPortalLink("main")}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: "var(--obs-accent)", color: "#000" }}>
            {copiedId === "main" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Link</>}
          </button>
        </div>
      </div>

      {/* Create client form */}
      {showForm && (
        <form onSubmit={createClient} className="p-5 rounded-xl border space-y-4"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Create Client Account</h3>
          {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444" }}>{error}</p>}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
              { label: "Temp Password", key: "password", type: "text", placeholder: "Min 8 chars" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--obs-muted)" }}>{label}</label>
                <input type={type} value={form[key as keyof typeof form]} placeholder={placeholder} required
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-black disabled:opacity-60"
              style={{ background: "var(--obs-accent)" }}>
              {saving ? "Creating…" : "Create Account"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-text)" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Clients list */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--obs-border)" }}>
          <Users size={15} style={{ color: "var(--obs-accent)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
            Client Accounts ({clients.length})
          </h3>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users size={32} className="mx-auto" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm" style={{ color: "var(--obs-muted)" }}>No client accounts yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create one above so clients can log in to the portal</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
              style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
              <span>Name</span><span>Email</span><span>Created</span><span></span>
            </div>
            {clients.map((c) => (
              <div key={c.id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-4 border-b last:border-0 items-center"
                style={{ borderColor: "var(--obs-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
                <p className="text-sm" style={{ color: "var(--obs-muted)" }}>{c.email}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
                <button onClick={() => copyPortalLink(c.email)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium"
                  style={{ background: "var(--obs-elevated)", color: copiedId === c.email ? "#16a34a" : "var(--obs-muted)" }}>
                  {copiedId === c.email ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Portal Link</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
