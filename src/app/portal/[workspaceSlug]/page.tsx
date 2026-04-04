"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default function ClientPortalLogin({ params }: Props) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/${workspaceSlug}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Invalid credentials"); setLoading(false); return; }
    router.push(`/portal/${workspaceSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--obs-bg)" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: "var(--obs-accent)" }}>
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>Client Portal</h1>
          <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Sign in to view your appointments and invoices</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-6"
          style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          {error && (
            <div className="text-sm px-3 py-2 rounded-lg" style={{ background: "#ef444418", color: "#ef4444" }}>
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--obs-muted)" }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
              style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--obs-muted)" }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
              style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--obs-accent)" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
