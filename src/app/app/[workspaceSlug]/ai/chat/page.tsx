"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-opus-4-6",   label: "Claude Opus 4.6"   },
  { id: "gpt-4o",            label: "GPT-4o"             },
  { id: "gpt-4o-mini",       label: "GPT-4o mini"        },
];

export default function AiChatPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("claude-sonnet-4-6");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, model, messages: [...messages, userMsg] }),
      });
      if (res.ok) {
        const { content } = await res.json();
        setMessages((p) => [...p, { role: "assistant", content }]);
      } else {
        setMessages((p) => [...p, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Please check your API keys in Settings." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: "var(--obs-border)" }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>AI Chat</h2>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Powered by your AI workspace</p>
        </div>
        <select value={model} onChange={(e) => setModel(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
          {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--obs-elevated)" }}>
              <Bot size={22} style={{ color: "var(--obs-accent)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>How can I help you today?</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Ask anything — drafts, analysis, summaries, code</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: msg.role === "user" ? "var(--obs-accent)" : "var(--obs-elevated)" }}>
              {msg.role === "user"
                ? <User size={13} className="text-white" />
                : <Bot size={13} style={{ color: "var(--obs-accent)" }} />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              style={{
                background: msg.role === "user" ? "var(--obs-accent)" : "var(--obs-elevated)",
                color: msg.role === "user" ? "#fff" : "var(--obs-text)",
              }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--obs-elevated)" }}>
              <Bot size={13} style={{ color: "var(--obs-accent)" }} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "var(--obs-elevated)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--obs-muted)" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t mt-4" style={{ borderColor: "var(--obs-border)" }}>
        <div className="flex items-end gap-3 p-3 rounded-xl border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message AI… (Enter to send, Shift+Enter for new line)"
            rows={1} className="flex-1 bg-transparent text-sm outline-none resize-none"
            style={{ color: "var(--obs-text)", maxHeight: "120px" }} />
          <button onClick={handleSend} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "var(--obs-accent)" }}>
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
