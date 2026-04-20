"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Mail, Send, Plus, Loader2, Inbox, Phone, AtSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConversationMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  channel: "sms" | "email";
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  subject: string | null;
  lastMessageAt: string | null;
  messages: ConversationMessage[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function InboxPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "sms" | "email">("all");
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ channel: "sms" as "sms" | "email", to: "", body: "", subject: "", name: "" });
  const [newSending, setNewSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    const q = channelFilter !== "all" ? `&channel=${channelFilter}` : "";
    const res = await fetch(`/api/inbox?workspace=${workspaceSlug}${q}`);
    if (res.ok) setConversations((await res.json()).conversations);
    setLoading(false);
  }, [workspaceSlug, channelFilter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const loadConversation = async (convo: Conversation) => {
    setSelected(convo);
    const res = await fetch(`/api/inbox/${convo.id}`);
    if (res.ok) {
      const { conversation } = await res.json();
      setMessages(conversation.messages);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async () => {
    if (!selected || !replyBody.trim()) return;
    setSending(true);
    const endpoint = selected.channel === "sms" ? "/api/sms/send" : "/api/email/send";
    const payload = selected.channel === "sms"
      ? { workspaceSlug, to: selected.contactPhone, body: replyBody, conversationId: selected.id, contactName: selected.contactName }
      : { workspaceSlug, to: selected.contactEmail, subject: `Re: ${selected.subject ?? "Message"}`, text: replyBody, conversationId: selected.id, contactName: selected.contactName };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages((p) => [...p, message]);
      setReplyBody("");
      toast.success("Sent");
      fetchConversations();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to send");
    }
    setSending(false);
  };

  const handleNew = async () => {
    if (!newForm.to.trim() || !newForm.body.trim()) { toast.error("Recipient and message required"); return; }
    setNewSending(true);
    const endpoint = newForm.channel === "sms" ? "/api/sms/send" : "/api/email/send";
    const payload = newForm.channel === "sms"
      ? { workspaceSlug, to: newForm.to, body: newForm.body, contactName: newForm.name || newForm.to }
      : { workspaceSlug, to: newForm.to, subject: newForm.subject || "Message", text: newForm.body, html: `<p>${newForm.body}</p>`, contactName: newForm.name || newForm.to };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(`${newForm.channel === "sms" ? "SMS" : "Email"} sent`);
      setNewOpen(false);
      setNewForm({ channel: "sms", to: "", body: "", subject: "", name: "" });
      fetchConversations();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to send");
    }
    setNewSending(false);
  };

  const filtered = channelFilter === "all" ? conversations : conversations.filter((c) => c.channel === channelFilter);
  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-0 rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--obs-border)" }}>

      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r flex flex-col"
        style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--obs-border)" }}>
          <h2 className="text-sm font-bold" style={{ color: "var(--obs-text)" }}>Inbox</h2>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--obs-accent)" }}>
              <Plus size={13} className="text-white" />
            </DialogTrigger>
            <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
              <DialogHeader>
                <DialogTitle style={{ color: "var(--obs-text)" }}>New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex gap-2">
                  {(["sms", "email"] as const).map((ch) => (
                    <button key={ch} onClick={() => setNewForm((p) => ({ ...p, channel: ch }))}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        background: newForm.channel === ch ? "var(--obs-accent)" : "var(--obs-elevated)",
                        color: newForm.channel === ch ? "#fff" : "var(--obs-muted)",
                      }}>
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>
                    {newForm.channel === "sms" ? "Phone Number" : "Email Address"} *
                  </Label>
                  <Input value={newForm.to} onChange={(e) => setNewForm((p) => ({ ...p, to: e.target.value }))}
                    placeholder={newForm.channel === "sms" ? "+1 555 000 0000" : "client@example.com"}
                    style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Contact Name</Label>
                  <Input value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith" style={inputStyle} />
                </div>
                {newForm.channel === "email" && (
                  <div className="space-y-1.5">
                    <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Subject</Label>
                    <Input value={newForm.subject} onChange={(e) => setNewForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="Hello from Stactoro" style={inputStyle} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Message *</Label>
                  <textarea value={newForm.body} onChange={(e) => setNewForm((p) => ({ ...p, body: e.target.value }))}
                    rows={4} placeholder="Type your message…"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                    style={inputStyle} />
                </div>
                <button onClick={handleNew} disabled={newSending}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--obs-accent)" }}>
                  {newSending ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <><Send size={13} /> Send</>}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b px-3 py-2 gap-1" style={{ borderColor: "var(--obs-border)" }}>
          {(["all", "sms", "email"] as const).map((f) => (
            <button key={f} onClick={() => setChannelFilter(f)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: channelFilter === f ? "var(--obs-accent)" : "transparent",
                color: channelFilter === f ? "#fff" : "var(--obs-muted)",
              }}>
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Inbox size={24} className="mx-auto mb-2" style={{ color: "var(--obs-muted)" }} />
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>No conversations yet</p>
            </div>
          ) : filtered.map((convo) => {
            const lastMsg = convo.messages[0];
            const isActive = selected?.id === convo.id;
            return (
              <button key={convo.id} onClick={() => loadConversation(convo)}
                className="w-full flex items-start gap-3 px-4 py-3 border-b text-left transition-colors hover:bg-white/5"
                style={{
                  borderColor: "var(--obs-border)",
                  background: isActive ? "rgba(245,158,11,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--obs-accent)" : "2px solid transparent",
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: convo.channel === "sms" ? "#6366F118" : "#22C55E18" }}>
                  {convo.channel === "sms"
                    ? <Phone size={13} style={{ color: "#6366F1" }} />
                    : <AtSign size={13} style={{ color: "#22C55E" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--obs-text)" }}>
                      {convo.contactName ?? convo.contactPhone ?? convo.contactEmail ?? "Unknown"}
                    </p>
                    {convo.lastMessageAt && (
                      <span className="text-[10px] shrink-0 ml-1" style={{ color: "var(--obs-muted)" }}>
                        {timeAgo(convo.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--obs-muted)" }}>
                    {lastMsg?.body ?? "No messages"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message thread */}
      {selected ? (
        <div className="flex-1 flex flex-col" style={{ background: "var(--obs-bg)" }}>
          {/* Thread header */}
          <div className="px-5 py-3.5 border-b flex items-center gap-3"
            style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: selected.channel === "sms" ? "#6366F118" : "#22C55E18" }}>
              {selected.channel === "sms"
                ? <Phone size={13} style={{ color: "#6366F1" }} />
                : <AtSign size={13} style={{ color: "#22C55E" }} />}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
                {selected.contactName ?? selected.contactPhone ?? selected.contactEmail}
              </p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                {selected.channel === "sms" ? selected.contactPhone : selected.contactEmail}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isOut = msg.direction === "outbound";
              return (
                <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isOut ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={{
                      background: isOut ? "var(--obs-accent)" : "var(--obs-surface)",
                      color: isOut ? "#fff" : "var(--obs-text)",
                      border: isOut ? "none" : `1px solid var(--obs-border)`,
                    }}>
                    {msg.body}
                    <p className={`text-[10px] mt-1 ${isOut ? "text-white/60" : ""}`}
                      style={isOut ? undefined : { color: "var(--obs-muted)" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isOut && ` · ${msg.status}`}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <div className="px-4 py-3 border-t" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
            <div className="flex items-end gap-3 p-3 rounded-xl border"
              style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
              <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                rows={2} placeholder={`Reply via ${selected.channel.toUpperCase()}… (Enter to send)`}
                className="flex-1 bg-transparent text-sm outline-none resize-none"
                style={{ color: "var(--obs-text)", maxHeight: "100px" }} />
              <button onClick={handleReply} disabled={!replyBody.trim() || sending}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40"
                style={{ background: "var(--obs-accent)" }}>
                {sending ? <Loader2 size={13} className="animate-spin text-white" /> : <Send size={13} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ background: "var(--obs-bg)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--obs-elevated)" }}>
            <MessageSquare size={22} style={{ color: "var(--obs-accent)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>Select a conversation</p>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
            or click + to start a new one
          </p>
        </div>
      )}
    </div>
  );
}
