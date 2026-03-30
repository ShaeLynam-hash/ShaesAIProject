"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", fromName: "", fromEmail: "", htmlBody: "" });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.fromEmail.trim()) { toast.error("Name, subject, and from email required"); return; }
    setCreating(true);
    const res = await fetch("/api/email/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form }) });
    if (res.ok) { toast.success("Campaign saved as draft"); router.push(`/app/${workspaceSlug}/email/campaigns`); }
    else toast.error("Failed to create campaign");
    setCreating(false);
  };

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--obs-muted)" }}><ArrowLeft size={16} /></button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>New Campaign</h2>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create and send an email campaign</p>
        </div>
      </div>

      <div className="p-5 rounded-xl border space-y-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Campaign Details</h3>
        <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Campaign Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Summer Sale 2024" style={iStyle} /></div>
        <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Subject Line *</Label><Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Don't miss our biggest sale of the year 🔥" style={iStyle} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Name</Label><Input value={form.fromName} onChange={(e) => setForm((p) => ({ ...p, fromName: e.target.value }))} placeholder="Acme Team" style={iStyle} /></div>
          <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>From Email *</Label><Input type="email" value={form.fromEmail} onChange={(e) => setForm((p) => ({ ...p, fromEmail: e.target.value }))} placeholder="hello@acme.com" style={iStyle} /></div>
        </div>
      </div>

      <div className="p-5 rounded-xl border space-y-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Email Body (HTML)</h3>
        <textarea value={form.htmlBody} onChange={(e) => setForm((p) => ({ ...p, htmlBody: e.target.value }))} rows={12} placeholder="<h1>Hello!</h1><p>Your email content here…</p>" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none font-mono text-xs" style={iStyle} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.back()} className="px-5 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>Cancel</button>
        <button onClick={handleCreate} disabled={creating} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
          {creating ? "Saving…" : "Save as Draft"}
        </button>
      </div>
    </div>
  );
}
