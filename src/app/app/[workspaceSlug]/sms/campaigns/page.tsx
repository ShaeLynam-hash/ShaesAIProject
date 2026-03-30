"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Campaign { id: string; name: string; message: string; status: string; recipientCount: number; deliveredCount: number; createdAt: string; }

export default function SmsCampaignsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", message: "" });

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch(`/api/sms/campaigns?workspace=${workspaceSlug}`);
    if (res.ok) setCampaigns((await res.json()).campaigns);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.message.trim()) { toast.error("Name and message required"); return; }
    if (form.message.length > 160) { toast.error("Message must be 160 characters or less"); return; }
    setCreating(true);
    const res = await fetch("/api/sms/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form }) });
    if (res.ok) { const { campaign } = await res.json(); setCampaigns((p) => [campaign, ...p]); setForm({ name: "", message: "" }); setOpen(false); toast.success("Campaign created"); }
    else toast.error("Failed to create");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/sms/campaigns/${id}`, { method: "DELETE" });
    if (res.ok) { setCampaigns((p) => p.filter((c) => c.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>SMS Campaigns</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Campaign
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>New SMS Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Campaign Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Flash Sale Alert" style={iStyle} /></div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Message * (160 chars)</Label><span className="text-[10px]" style={{ color: form.message.length > 160 ? "var(--obs-danger)" : "var(--obs-muted)" }}>{form.message.length}/160</span></div>
                <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={4} maxLength={160} placeholder="Your message here…" className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={iStyle} />
              </div>
              <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>{creating ? "Creating…" : "Create Campaign"}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Campaign</span><span>Message</span><span>Status</span><span>Sent</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : campaigns.length === 0 ? (
          <div className="py-12 text-center"><MessageSquare size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} /><p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No campaigns yet</p></div>
        ) : campaigns.map((c) => (
          <div key={c.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
            <p className="text-xs line-clamp-2" style={{ color: "var(--obs-muted)" }}>{c.message}</p>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: c.status === "SENT" ? "#22C55E18" : "var(--obs-elevated)", color: c.status === "SENT" ? "var(--obs-success)" : "var(--obs-muted)" }}>{c.status}</span>
            <p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.recipientCount.toLocaleString()}</p>
            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"><Trash2 size={14} style={{ color: "var(--obs-danger)" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
