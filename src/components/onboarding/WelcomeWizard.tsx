"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ArrowRight, X, Sparkles, ChevronRight } from "lucide-react";

interface Step { id: string; label: string; done: boolean; href: string | null }
interface Props { workspaceSlug: string; workspaceName: string }

const STEP_ICONS: Record<string, string> = {
  workspace:  "🏠",
  contact:    "👤",
  invoice:    "💳",
  sms:        "📱",
  email:      "✉️",
  team:       "👥",
  booking:    "📅",
  campaign:   "📢",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  workspace:  "Your workspace is live and ready to go.",
  contact:    "Add a customer or lead to your CRM.",
  invoice:    "Create and send your first invoice.",
  sms:        "Claim a dedicated phone number for SMS.",
  email:      "Connect your email to send campaigns from your own address.",
  team:       "Bring a colleague onboard.",
  booking:    "Let clients book appointments with you.",
  campaign:   "Reach your contacts with a bulk message.",
};

export function WelcomeWizard({ workspaceSlug, workspaceName }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [completed, setCompleted] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `stactoro_welcome_${workspaceSlug}`;
    const seen = localStorage.getItem(key);
    fetch(`/api/workspaces/setup-status?workspace=${workspaceSlug}`)
      .then((r) => r.json())
      .then((data) => {
        setSteps(data.steps ?? []);
        setCompleted(data.completed ?? 0);
        if (!seen && data.completed < 3) {
          setShowModal(true);
          localStorage.setItem(key, "1");
        }
      });
  }, [workspaceSlug]);

  const dismiss = () => setDismissed(true);
  const pct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  const allDone = completed === steps.length;

  if (dismissed || steps.length === 0) return null;

  return (
    <>
      {/* ── Welcome modal (first visit only) ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div style={{ width: "100%", maxWidth: 540, background: "#0F0F12", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(245,158,11,0.1)" }}>
            {/* Header */}
            <div style={{ padding: "36px 36px 28px", textAlign: "center", position: "relative", background: "linear-gradient(180deg, rgba(245,158,11,0.07) 0%, transparent 100%)" }}>
              <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", color: "#6B6B76", cursor: "pointer", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
              <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, boxShadow: "0 8px 32px rgba(245,158,11,0.35)" }}>
                ✨
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#F2F2F5", letterSpacing: "-0.02em", marginBottom: 10 }}>
                Welcome to Stactoro!
              </h2>
              <p style={{ fontSize: 14, color: "#6B6B76", lineHeight: 1.6 }}>
                <strong style={{ color: "#F59E0B" }}>{workspaceName}</strong> is all set up. Let&apos;s walk through a few quick steps to unlock the full power of your platform.
              </p>
            </div>

            {/* Steps preview */}
            <div style={{ padding: "0 28px 28px" }}>
              {steps.slice(1, 5).map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{STEP_ICONS[s.id]}</span>
                  <span style={{ flex: 1, fontSize: 14, color: s.done ? "rgba(255,255,255,0.3)" : "#EDEDF0", textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
                  {s.done
                    ? <CheckCircle2 size={16} style={{ color: "#22C55E", flexShrink: 0 }} />
                    : <Circle size={16} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />}
                </div>
              ))}
              <p style={{ fontSize: 12, color: "#4B4B56", textAlign: "center", marginTop: 8 }}>+{steps.length - 5} more steps</p>
            </div>

            {/* CTA */}
            <div style={{ padding: "0 28px 28px", display: "flex", gap: 10 }}>
              <button onClick={() => { setShowModal(false); if (steps.find((s) => !s.done && s.href)) router.push(`/app/${workspaceSlug}/${steps.find((s) => !s.done && s.href)!.href}`); }}
                style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Get Started <ArrowRight size={16} />
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B6B76", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard checklist widget ── */}
      <div style={{ background: "#111114", border: `1px solid ${allDone ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={13} style={{ color: allDone ? "#22C55E" : "#F59E0B" }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F5" }}>
                {allDone ? "All set! 🎉" : "Getting Started"}
              </h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#22C55E" : "#F59E0B" }}>{completed}/{steps.length}</span>
              <button onClick={dismiss} style={{ background: "none", border: "none", color: "#3A3A42", cursor: "pointer", padding: 2, display: "flex" }}>
                <X size={12} />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: allDone ? "#22C55E" : "linear-gradient(90deg, #F59E0B, #D97706)", borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: "8px 12px" }}>
          {steps.map((s) => {
            const content = (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 6px", borderRadius: 7, transition: "background 0.15s" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{STEP_ICONS[s.id]}</span>
                {s.done
                  ? <CheckCircle2 size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
                  : <Circle size={13} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />}
                <span style={{ fontSize: 12, color: s.done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)", textDecoration: s.done ? "line-through" : "none", flex: 1 }}>
                  {s.label}
                </span>
                {!s.done && s.href && <ChevronRight size={11} style={{ color: "#3A3A42", flexShrink: 0 }} />}
              </div>
            );

            return s.href && !s.done ? (
              <a key={s.id} href={`/app/${workspaceSlug}/${s.href}`} style={{ display: "block", textDecoration: "none" }}>{content}</a>
            ) : (
              <div key={s.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </>
  );
}
