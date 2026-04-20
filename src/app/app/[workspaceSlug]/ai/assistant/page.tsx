"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Bot, User, Loader2, RotateCcw, Sparkles } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "How is my business performing this month?",
  "What are my top priorities today?",
  "How many leads do I have and what's my pipeline worth?",
  "Which invoices need my attention?",
  "Summarize my financial health",
  "What should I focus on to grow revenue?",
];

export default function AssistantPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/business-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          model: "claude-sonnet-4-6",
          messages: [...messages, userMsg],
        }),
      });
      const { content } = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: content ?? "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #F59E0B18, #6366F118)" }}>
            <Sparkles size={16} style={{ color: "var(--obs-accent)" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--obs-text)" }}>Business Assistant</h2>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Knows your live contacts, revenue, invoices & pipeline</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
            <RotateCcw size={11} /> New chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="space-y-5">
            <div className="flex flex-col items-center py-8 gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--obs-elevated)" }}>
                <Bot size={24} style={{ color: "var(--obs-accent)" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
                Your business, fully context-aware
              </p>
              <p className="text-xs text-center max-w-xs" style={{ color: "var(--obs-muted)" }}>
                Ask me anything about your contacts, revenue, invoices, pipeline, or what to focus on next.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="p-3 rounded-xl border text-left text-xs font-medium transition-colors hover:border-[var(--obs-accent)]"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
                  {q}
                </button>
              ))}
            </div>
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
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
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
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--obs-elevated)" }}>
              <Bot size={13} style={{ color: "var(--obs-accent)" }} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2"
              style={{ background: "var(--obs-elevated)" }}>
              <Loader2 size={13} className="animate-spin" style={{ color: "var(--obs-accent)" }} />
              <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Analyzing your data…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4 border-t mt-4" style={{ borderColor: "var(--obs-border)" }}>
        <div className="flex items-end gap-3 p-3 rounded-xl border"
          style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask about your business… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none"
            style={{ color: "var(--obs-text)", maxHeight: "120px" }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "var(--obs-accent)" }}>
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
