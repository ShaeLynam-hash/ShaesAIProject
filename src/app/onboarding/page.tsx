"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Palette, Users, Mail, CreditCard, CheckCircle, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Your Business", icon: Building2 },
  { id: 2, label: "Personalize",   icon: Palette    },
  { id: 3, label: "Team",          icon: Users      },
  { id: 4, label: "Email",         icon: Mail       },
  { id: 5, label: "Plan",          icon: CreditCard },
];

const INDUSTRIES = ["Technology","Healthcare","Finance","Retail","Education","Real Estate","Marketing","Legal","Construction","Food & Beverage","Fitness","Beauty & Wellness","Other"];
const TIMEZONES  = ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Phoenix","Europe/London","Europe/Paris","Asia/Tokyo","Asia/Singapore","Australia/Sydney"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 10,
  color: "#EDEDF0",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#6B6B76",
  marginBottom: 6,
  letterSpacing: "0.02em",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [inviteEmails, setInviteEmails] = useState(["", ""]);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const [form, setForm] = useState({
    name: "", industry: "", timezone: "America/New_York", website: "",
  });

  const [smtpForm, setSmtpForm] = useState({
    host: "", port: "587", username: "", password: "", fromEmail: "", fromName: "",
  });

  function setSmtp(key: string, value: string) {
    setSmtpForm((f) => ({ ...f, [key]: value }));
  }

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name") setWorkspaceSlug(slugify(value));
  }

  async function submit() {
    if (!form.name || form.name.length < 2) { setSubmitError("Enter your business name"); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, industry: form.industry, timezone: form.timezone, website: form.website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error ?? `Error ${res.status} — please try again`);
        setSubmitting(false);
        return;
      }
      const slug = data.workspace.slug;
      // Save SMTP if provided
      if (smtpForm.host && smtpForm.username && smtpForm.password) {
        await fetch(`/api/integrations/smtp/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceSlug: slug, ...smtpForm, fromEmail: smtpForm.username }),
        }).catch(() => null);
      }
      router.push(`/app/${slug}/dashboard`);
    } catch {
      setSubmitError("Network error — please check your connection and try again");
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070709",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#EDEDF0",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: -200, left: "30%", width: 600, height: 400, background: "rgba(245,158,11,0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <img src="/stactoro-logo.jpg" width="38" height="38" alt="Stactoro" style={{ objectFit: "contain" }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: "#EDEDF0", letterSpacing: "-0.02em" }}>Stactoro</span>
          </a>
        </div>

        {/* Step indicators */}
        {step < 6 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                      background: done ? "#F59E0B" : active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                      border: active ? "1.5px solid rgba(245,158,11,0.5)" : done ? "none" : "1.5px solid rgba(255,255,255,0.08)",
                      color: done ? "#0a0800" : active ? "#F59E0B" : "#4B4B56",
                    }}>
                      {done ? <Check size={13} /> : s.id}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#EDEDF0" : done ? "#F59E0B" : "#3A3A42" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 32, height: 1, background: done ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)", margin: "0 8px" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 32px" }}>

          {/* ── Step 1: Business Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Tell us about your business</h2>
                <p style={{ fontSize: 14, color: "#5B5B66" }}>We'll use this to set up your workspace.</p>
              </div>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Inc." style={inputStyle} />
                {workspaceSlug && <p style={{ fontSize: 12, color: "#3A3A42", marginTop: 5 }}>Your URL: <span style={{ color: "#F59E0B" }}>stactoro.app/app/{workspaceSlug}</span></p>}
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <select value={form.industry} onChange={(e) => set("industry", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="" style={{ background: "#0F0F12" }}>Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i} style={{ background: "#0F0F12" }}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timezone</label>
                <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {TIMEZONES.map((t) => <option key={t} value={t} style={{ background: "#0F0F12" }}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => { if (form.name.length >= 2) setStep(2); else setSubmitError("Enter your business name"); }}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Personalize ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Personalize your workspace</h2>
                <p style={{ fontSize: 14, color: "#5B5B66" }}>Optional — you can always change this later.</p>
              </div>
              <div>
                <label style={labelStyle}>Website URL</label>
                <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourcompany.com" style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)}
                  style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#EDEDF0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Invite Team ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Invite your team</h2>
                <p style={{ fontSize: 14, color: "#5B5B66" }}>Optional — they'll get an email invite.</p>
              </div>
              {inviteEmails.map((email, i) => (
                <div key={i}>
                  <label style={labelStyle}>Team Member {i + 1}</label>
                  <input type="email" value={email} onChange={(e) => { const u = [...inviteEmails]; u[i] = e.target.value; setInviteEmails(u); }}
                    placeholder="colleague@company.com" style={inputStyle} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)}
                  style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#EDEDF0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(4)}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Continue <ArrowRight size={15} />
                </button>
              </div>
              <button onClick={() => setStep(4)} style={{ background: "none", border: "none", color: "#3A3A42", fontSize: 13, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                Skip for now
              </button>
            </div>
          )}

          {/* ── Step 4: Connect Email ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Connect your email</h2>
                <p style={{ fontSize: 14, color: "#5B5B66" }}>Send campaigns and invoices from your own address. You can also connect Gmail from the Connections page after setup.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>SMTP Host</label>
                  <input value={smtpForm.host} onChange={(e) => setSmtp("host", e.target.value)} placeholder="smtp.gmail.com" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Port</label>
                  <input value={smtpForm.port} onChange={(e) => setSmtp("port", e.target.value)} placeholder="587" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Username / Email</label>
                <input type="email" value={smtpForm.username} onChange={(e) => setSmtp("username", e.target.value)} placeholder="you@yourdomain.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password / App Password</label>
                <input type="password" value={smtpForm.password} onChange={(e) => setSmtp("password", e.target.value)} placeholder="••••••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>From Name (optional)</label>
                <input value={smtpForm.fromName} onChange={(e) => setSmtp("fromName", e.target.value)} placeholder="Your Business Name" style={inputStyle} />
              </div>
              <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, fontSize: 12, color: "#8B7D4A", lineHeight: 1.5 }}>
                💡 Using Gmail? Enable 2-factor auth and create an <strong style={{ color: "#F59E0B" }}>App Password</strong> at myaccount.google.com — then use that as your password here.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(3)}
                  style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#EDEDF0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(5)}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Continue <ArrowRight size={15} />
                </button>
              </div>
              <button onClick={() => setStep(5)} style={{ background: "none", border: "none", color: "#3A3A42", fontSize: 13, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                Skip for now
              </button>
            </div>
          )}

          {/* ── Step 5: Choose Plan ── */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Choose your plan</h2>
                <p style={{ fontSize: 14, color: "#5B5B66" }}>14-day free trial on all plans. No credit card needed.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "starter", name: "Starter", price: "$49/mo", salePrice: "$24.50", desc: "For small businesses getting started", features: ["3 team members", "All core modules", "1,000 emails/mo"] },
                  { key: "pro",     name: "Pro",     price: "$99/mo", salePrice: "$49.50", desc: "For growing teams that need more",  features: ["10 team members", "All modules + AI", "10,000 emails/mo"], popular: true },
                  { key: "agency",  name: "Agency",  price: "$249/mo", salePrice: "$124.50", desc: "For agencies managing multiple clients", features: ["Unlimited members", "White-label", "Priority support"] },
                ].map((plan) => (
                  <div key={plan.key} onClick={() => setSelectedPlan(plan.key)}
                    style={{
                      padding: "16px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                      border: selectedPlan === plan.key ? "1.5px solid rgba(245,158,11,0.6)" : "1px solid rgba(255,255,255,0.07)",
                      background: selectedPlan === plan.key ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
                      position: "relative",
                    }}>
                    {plan.popular && (
                      <div style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0a0800", fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 100, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{plan.name}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>{plan.salePrice}</span>
                          <span style={{ fontSize: 12, color: "#4B4B56", textDecoration: "line-through" }}>{plan.price}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#5B5B66", marginTop: 2 }}>{plan.desc} · <span style={{ color: "#F59E0B", fontWeight: 600 }}>50% off first month</span></p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: selectedPlan === plan.key ? "none" : "1.5px solid rgba(255,255,255,0.15)", background: selectedPlan === plan.key ? "#F59E0B" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selectedPlan === plan.key && <Check size={11} color="#0a0800" strokeWidth={3} />}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      {plan.features.map((f) => (
                        <span key={f} style={{ fontSize: 11, color: "#3A3A42", fontWeight: 500 }}>✓ {f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {submitError && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#fca5a5" }}>
                  {submitError}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(4)}
                  style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#EDEDF0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={submit} disabled={submitting}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {submitting ? "Setting up…" : <><span>Start Free Trial</span> <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Done ── */}
          {step === 6 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 72, height: 72, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={36} color="#F59E0B" />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>You're all set! 🎉</h2>
              <p style={{ fontSize: 15, color: "#5B5B66", marginBottom: 32, lineHeight: 1.6 }}>
                Your Stactoro workspace is ready.<br />Everything your business needs is waiting for you.
              </p>
              <button onClick={() => router.push(`/app/${workspaceSlug}/dashboard`)}
                style={{ padding: "14px 36px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 10 }}>
                Go to Dashboard <ArrowRight size={17} />
              </button>
              <p style={{ fontSize: 12, color: "#3A3A42", marginTop: 16 }}>
                stactoro.app/app/{workspaceSlug}
              </p>
            </div>
          )}
        </div>

        {step < 6 && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#2A2A32", marginTop: 20 }}>
            Secured with 256-bit encryption · No credit card required
          </p>
        )}
      </div>
    </div>
  );
}
