"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Building2, User, Tag, Calendar, Star,
  MessageSquare, TrendingUp, FileText, Send, Trash2, Plus, Edit2, Check, X,
} from "lucide-react";

interface ContactNote { id: string; body: string; createdAt: string }
interface Deal { id: string; title: string; value: number; stage: string; probability: number }
interface Message { id: string; direction: string; body: string; createdAt: string }
interface Conversation { id: string; channel: string; contactName: string | null; lastMessageAt: string | null; messages: Message[] }
interface Contact {
  id: string; firstName: string; lastName: string | null; email: string | null;
  phone: string | null; company: string | null; title: string | null; status: string;
  source: string | null; tags: string[]; notes: string | null; leadScore: number;
  createdAt: string; updatedAt: string;
  deals: Deal[]; conversations: Conversation[]; contactNotes: ContactNote[];
}

const STATUSES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"];
const STAGE_COLORS: Record<string, string> = {
  LEAD: "#6366F1", QUALIFIED: "#818CF8", PROPOSAL: "#F59E0B",
  NEGOTIATION: "#EC4899", CLOSED_WON: "#22C55E", CLOSED_LOST: "#EF4444",
};
const STATUS_COLORS: Record<string, string> = {
  LEAD: "#6366F1", PROSPECT: "#F59E0B", CUSTOMER: "#22C55E", CHURNED: "#EF4444",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const contactId = params?.contactId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "notes" | "deals" | "messages">("notes");
  const [noteInput, setNoteInput] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", title: "", status: "LEAD", notes: "" });
  const [saving, setSaving] = useState(false);
  const [quickSmsTo, setQuickSmsTo] = useState("");
  const [quickSmsBody, setQuickSmsBody] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  const fetchContact = useCallback(async () => {
    const res = await fetch(`/api/crm/contacts/${contactId}`);
    if (res.ok) {
      const { contact: c } = await res.json();
      setContact(c);
      setEditForm({ firstName: c.firstName, lastName: c.lastName ?? "", email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "", title: c.title ?? "", status: c.status, notes: c.notes ?? "" });
    } else {
      toast.error("Contact not found");
    }
    setLoading(false);
  }, [contactId]);

  useEffect(() => { fetchContact(); }, [fetchContact]);

  const handleSaveEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/crm/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { toast.success("Saved"); setEditing(false); fetchContact(); }
    else toast.error("Failed to save");
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setAddingNote(true);
    const res = await fetch(`/api/crm/contacts/${contactId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: noteInput }),
    });
    if (res.ok) { setNoteInput(""); fetchContact(); toast.success("Note added"); }
    else toast.error("Failed to add note");
    setAddingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    const res = await fetch(`/api/crm/contacts/${contactId}/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    if (res.ok) fetchContact();
    setDeletingNoteId(null);
  };

  const handleQuickSms = async () => {
    if (!quickSmsBody.trim() || !quickSmsTo) return;
    setSendingSms(true);
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, to: quickSmsTo, body: quickSmsBody, contactName: contact ? `${contact.firstName} ${contact.lastName ?? ""}`.trim() : undefined }),
    });
    if (res.ok) { setQuickSmsBody(""); toast.success("SMS sent!"); }
    else { const err = await res.json(); toast.error(err.error ?? "Failed to send SMS"); }
    setSendingSms(false);
  };

  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>;
  if (!contact) return <div className="text-center py-12 text-sm" style={{ color: "var(--obs-muted)" }}>Contact not found</div>;

  const statusColor = STATUS_COLORS[contact.status] ?? "#6366F1";
  const pipelineValue = contact.deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back button */}
      <button onClick={() => router.push(`/app/${workspaceSlug}/crm/contacts`)}
        className="flex items-center gap-1.5 text-sm" style={{ color: "var(--obs-muted)" }}>
        <ArrowLeft size={14} /> Back to Contacts
      </button>

      {/* Header card */}
      <div className="rounded-xl border p-5" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: statusColor }}>
            {contact.firstName[0]}{contact.lastName?.[0] ?? ""}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={editForm.firstName} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="First name" />
                  <input value={editForm.lastName} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="Last name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="Email" />
                  <input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="Phone" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={editForm.company} onChange={(e) => setEditForm((p) => ({ ...p, company: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="Company" />
                  <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle} placeholder="Title" />
                </div>
                <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none" style={iStyle}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" rows={3} style={iStyle} placeholder="Internal notes…" />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "var(--obs-accent)" }}>
                    <Check size={13} /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>{contact.firstName} {contact.lastName ?? ""}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                    {contact.status}
                  </span>
                  {contact.leadScore > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
                      <Star size={10} fill="#F59E0B" /> {contact.leadScore}
                    </span>
                  )}
                </div>
                {contact.title && <p className="text-sm" style={{ color: "var(--obs-muted)" }}>{contact.title}</p>}
                <div className="flex flex-wrap gap-4 mt-2">
                  {contact.company && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} style={{ color: "var(--obs-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--obs-text)" }}>{contact.company}</span>
                    </div>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5">
                      <Mail size={13} style={{ color: "var(--obs-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--obs-accent)" }}>{contact.email}</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5">
                      <Phone size={13} style={{ color: "var(--obs-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--obs-accent)" }}>{contact.phone}</span>
                    </a>
                  )}
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                        <Tag size={9} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                {contact.notes && (
                  <p className="text-sm mt-2 italic" style={{ color: "var(--obs-muted)" }}>{contact.notes}</p>
                )}
              </>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pipeline Value", value: fmt(pipelineValue), icon: TrendingUp, color: "#22C55E" },
          { label: "Active Deals", value: contact.deals.filter((d) => !["CLOSED_WON","CLOSED_LOST"].includes(d.stage)).length, icon: TrendingUp, color: "#6366F1" },
          { label: "Notes", value: contact.contactNotes.length, icon: FileText, color: "#F59E0B" },
          { label: "Conversations", value: contact.conversations.length, icon: MessageSquare, color: "#EC4899" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} style={{ color }} />
              <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--obs-text)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Left: tabs */}
        <div className="space-y-4">
          <div className="flex gap-1 border-b" style={{ borderColor: "var(--obs-border)" }}>
            {(["notes", "deals", "messages"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors"
                style={{
                  borderColor: activeTab === tab ? "var(--obs-accent)" : "transparent",
                  color: activeTab === tab ? "var(--obs-text)" : "var(--obs-muted)",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Notes tab */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note…"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={iStyle} rows={3} />
                <button onClick={handleAddNote} disabled={addingNote || !noteInput.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white self-end disabled:opacity-50"
                  style={{ background: "var(--obs-accent)" }}>
                  <Plus size={14} />
                </button>
              </div>
              {contact.contactNotes.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No notes yet</div>
              ) : contact.contactNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--obs-text)" }}>{note.body}</p>
                    <button onClick={() => handleDeleteNote(note.id)} disabled={deletingNoteId === note.id}
                      className="p-1 rounded hover:bg-red-500/10 shrink-0 disabled:opacity-50">
                      <Trash2 size={12} style={{ color: "var(--obs-danger)" }} />
                    </button>
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: "var(--obs-muted)" }}>
                    <Calendar size={9} className="inline mr-1" />
                    {timeAgo(note.createdAt)} · {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Deals tab */}
          {activeTab === "deals" && (
            <div className="space-y-2">
              {contact.deals.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No deals linked</div>
              ) : contact.deals.map((deal) => {
                const color = STAGE_COLORS[deal.stage] ?? "#6366F1";
                return (
                  <div key={deal.id} className="p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{deal.title}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${color}18`, color }}>{deal.stage.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold" style={{ color }}>{fmt(deal.value)}</p>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--obs-elevated)" }}>
                        <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: color }} />
                      </div>
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{deal.probability}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Messages tab */}
          {activeTab === "messages" && (
            <div className="space-y-2">
              {contact.conversations.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--obs-muted)" }}>No conversations yet</div>
              ) : contact.conversations.map((conv) => {
                const lastMsg = conv.messages[0];
                return (
                  <div key={conv.id} className="p-4 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>{conv.channel}</span>
                      <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ""}</span>
                    </div>
                    {lastMsg && <p className="text-sm truncate" style={{ color: "var(--obs-text)" }}>{lastMsg.body}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick SMS */}
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--obs-border)" }}>
              <Send size={13} style={{ color: "#6366F1" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Quick SMS</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--obs-muted)" }}>To number</label>
                <input
                  value={quickSmsTo || contact.phone || ""}
                  onChange={(e) => setQuickSmsTo(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={iStyle}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--obs-muted)" }}>Message</label>
                <textarea
                  value={quickSmsBody}
                  onChange={(e) => setQuickSmsBody(e.target.value)}
                  placeholder="Hi, just wanted to follow up…"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={iStyle} rows={3}
                />
                <p className="text-[10px] mt-1 text-right" style={{ color: "var(--obs-muted)" }}>{quickSmsBody.length}/160</p>
              </div>
              <button onClick={handleQuickSms} disabled={sendingSms || !quickSmsBody.trim() || !quickSmsTo}
                className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "#6366F1" }}>
                {sendingSms ? "Sending…" : "Send SMS"}
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--obs-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Contact Info</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: User, label: "Source", value: contact.source },
                { icon: Calendar, label: "Added", value: new Date(contact.createdAt).toLocaleDateString() },
                { icon: Calendar, label: "Updated", value: timeAgo(contact.updatedAt) },
              ].map(({ icon: Icon, label, value }) => value && (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--obs-muted)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>{label}</p>
                    <p className="text-xs" style={{ color: "var(--obs-text)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
