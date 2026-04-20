"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, X, Send, RefreshCw, Bot } from "lucide-react";

interface ChatMessage { id: string; role: string; content: string; createdAt: string; }
interface ChatConversation {
  id: string; visitorId: string; visitorName?: string; visitorEmail?: string;
  status: string; createdAt: string; updatedAt: string;
  messages: ChatMessage[];
  _count: { messages: number };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function ChatInboxPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [convs, setConvs] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"OPEN" | "CLOSED">("OPEN");
  const [loading, setLoading] = useState(true);
  const msgBottom = useRef<HTMLDivElement>(null);

  const fetchConvs = useCallback(async () => {
    const res = await fetch(`/api/chat/conversations?workspace=${workspaceSlug}&status=${filter}`);
    const data = await res.json();
    setConvs(data.conversations ?? []);
    setLoading(false);
  }, [workspaceSlug, filter]);

  const fetchMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/chat/conversations/${convId}/messages`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setTimeout(() => msgBottom.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Poll conversations every 5s
  useEffect(() => {
    fetchConvs();
    const t = setInterval(fetchConvs, 5000);
    return () => clearInterval(t);
  }, [fetchConvs]);

  // Poll messages every 3s when conversation selected
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);
    const t = setInterval(() => fetchMessages(selected.id), 3000);
    return () => clearInterval(t);
  }, [selected, fetchMessages]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    await fetch(`/api/chat/conversations/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "agent", content: reply.trim() }),
    });
    setReply("");
    setSending(false);
    fetchMessages(selected.id);
  };

  const closeConv = async () => {
    if (!selected) return;
    await fetch(`/api/chat/conversations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    setSelected(null);
    fetchConvs();
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 0 }}>
      {/* Left: conversation list */}
      <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--obs-border)", background: "var(--obs-surface)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--obs-border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--obs-text)", marginBottom: 10 }}>Live Chat</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["OPEN", "CLOSED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filter === f ? "var(--obs-accent)" : "var(--obs-elevated)", color: filter === f ? "#fff" : "var(--obs-muted)" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--obs-muted)" }}>Loading…</p>
          ) : convs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <MessageCircle size={32} style={{ color: "var(--obs-muted)", margin: "0 auto 12px", display: "block" }} />
              <p style={{ fontSize: 13, color: "var(--obs-muted)" }}>No {filter.toLowerCase()} conversations</p>
            </div>
          ) : convs.map(c => {
            const lastMsg = c.messages?.[0];
            return (
              <div key={c.id} onClick={() => setSelected(c)}
                style={{ padding: "12px 16px", borderBottom: "1px solid var(--obs-border)", cursor: "pointer", background: selected?.id === c.id ? "var(--obs-elevated)" : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)" }}>{c.visitorName ?? c.visitorEmail ?? `Visitor ${c.visitorId.slice(-4)}`}</span>
                  <span style={{ fontSize: 11, color: "var(--obs-muted)" }}>{timeAgo(c.updatedAt)}</span>
                </div>
                {lastMsg && <p style={{ fontSize: 12, color: "var(--obs-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg.content}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: c.status === "OPEN" ? "#10B98120" : "var(--obs-border)", color: c.status === "OPEN" ? "#10B981" : "var(--obs-muted)" }}>{c.status}</span>
                  <span style={{ fontSize: 10, color: "var(--obs-muted)" }}>{c._count.messages} msgs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: message thread */}
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--obs-border)", background: "var(--obs-surface)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--obs-text)" }}>{selected.visitorName ?? selected.visitorEmail ?? `Visitor ${selected.visitorId.slice(-4)}`}</p>
              {selected.visitorEmail && <p style={{ fontSize: 12, color: "var(--obs-muted)" }}>{selected.visitorEmail}</p>}
            </div>
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, background: selected.status === "OPEN" ? "#10B98120" : "var(--obs-border)", color: selected.status === "OPEN" ? "#10B981" : "var(--obs-muted)" }}>{selected.status}</span>
            {selected.status === "OPEN" && (
              <button onClick={closeConv} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--obs-border)", background: "none", color: "var(--obs-muted)", fontSize: 12, cursor: "pointer" }}>Close</button>
            )}
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)" }}><X size={16} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(m => {
              const isVisitor = m.role === "visitor";
              const isAI = m.role === "ai";
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isVisitor ? "flex-start" : "flex-end" }}>
                  <div style={{ maxWidth: "72%", position: "relative" }}>
                    {isAI && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        <Bot size={10} style={{ color: "var(--obs-muted)" }} />
                        <span style={{ fontSize: 10, color: "var(--obs-muted)" }}>AI</span>
                      </div>
                    )}
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: isVisitor ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: isVisitor ? "var(--obs-elevated)" : isAI ? "rgba(99,102,241,0.12)" : "var(--obs-accent)",
                      color: isVisitor ? "var(--obs-text)" : isAI ? "var(--obs-text)" : "#fff",
                    }}>
                      {m.content}
                    </div>
                    <p style={{ fontSize: 10, color: "var(--obs-muted)", marginTop: 3, textAlign: isVisitor ? "left" : "right" }}>{timeAgo(m.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={msgBottom} />
          </div>

          {/* Reply box */}
          {selected.status === "OPEN" && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--obs-border)", background: "var(--obs-surface)", display: "flex", gap: 10 }}>
              <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Type a reply…"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--obs-border)", background: "var(--obs-bg)", color: "var(--obs-text)", fontSize: 13, outline: "none" }} />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                style={{ padding: "10px 18px", borderRadius: 10, background: "var(--obs-accent)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: (sending || !reply.trim()) ? 0.6 : 1 }}>
                {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <MessageCircle size={48} style={{ color: "var(--obs-muted)" }} />
          <p style={{ fontSize: 14, color: "var(--obs-text)", fontWeight: 600 }}>Select a conversation</p>
          <p style={{ fontSize: 12, color: "var(--obs-muted)" }}>Choose from the list to start replying</p>
        </div>
      )}
    </div>
  );
}
