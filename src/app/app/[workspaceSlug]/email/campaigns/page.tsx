"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Send, Trash2, Loader2 } from "lucide-react";

interface Campaign { id: string; name: string; subject: string; status: string; recipientCount: number; openCount: number; clickCount: number; sentAt: string | null; createdAt: string; }

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "#6B6B7618", text: "var(--obs-muted)"   },
  SENT:      { bg: "#22C55E18", text: "var(--obs-success)" },
  SCHEDULED: { bg: "#F59E0B18", text: "#F59E0B"            },
};

export default function CampaignsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch(`/api/email/campaigns?workspace=${workspaceSlug}`);
    if (res.ok) setCampaigns((await res.json()).campaigns);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSend = async (id: string) => {
    if (!confirm("Send this campaign to all contacts with email addresses?")) return;
    setSendingId(id);
    const res = await fetch(`/api/email/campaigns/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, segment: "all" }),
    });
    if (res.ok) {
      const { sent, failed } = await res.json();
      toast.success(`Sent to ${sent} contacts${failed > 0 ? `, ${failed} failed` : ""}`);
      fetchCampaigns();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to send");
    }
    setSendingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/email/campaigns/${id}`, { method: "DELETE" });
    if (res.ok) { setCampaigns((p) => p.filter((c) => c.id !== id)); toast.success("Campaign deleted"); }
    setDeletingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Campaigns</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => router.push(`/app/${workspaceSlug}/email/campaigns/new`)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
          <Plus size={15} /> New Campaign
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Campaign</span><span>Status</span><span>Sent</span><span>Opens</span><span>Clicks</span><span /><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <Send size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>No campaigns yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create your first email campaign</p>
          </div>
        ) : campaigns.map((c) => {
          const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS.DRAFT;
          const openRate = c.recipientCount > 0 ? ((c.openCount / c.recipientCount) * 100).toFixed(1) : "—";
          const clickRate = c.recipientCount > 0 ? ((c.clickCount / c.recipientCount) * 100).toFixed(1) : "—";
          return (
            <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.subject}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: sc.bg, color: sc.text }}>{c.status}</span>
              <p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.recipientCount.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--obs-text)" }}>{openRate}{c.recipientCount > 0 ? "%" : ""}</p>
              <p className="text-sm" style={{ color: "var(--obs-text)" }}>{clickRate}{c.recipientCount > 0 ? "%" : ""}</p>
              {c.status !== "SENT" ? (
                <button onClick={() => handleSend(c.id)} disabled={sendingId === c.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--obs-accent)" }}>
                  {sendingId === c.id ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                  Send
                </button>
              ) : <div />}
              <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
