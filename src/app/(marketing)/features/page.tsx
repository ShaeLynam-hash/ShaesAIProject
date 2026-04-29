import Link from "next/link";
import {
  Users,
  Mail,
  MessageSquare,
  CreditCard,
  CalendarDays,
  Calendar,
  FileText,
  Zap,
  Sparkles,
  MessageCircle,
  BarChart3,
  Shield,
  HardDrive,
  Globe,
  Plug,
  Webhook,
} from "lucide-react";

const features = [
  {
    icon: Users,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "CRM & Sales Pipeline",
    desc: "Track every contact, deal, and follow-up across a visual pipeline. Never lose a lead or miss a follow-up again.",
  },
  {
    icon: Mail,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.14)",
    title: "Email Marketing",
    desc: "Design beautiful campaigns and drip sequences with a drag-and-drop editor. AI writes the copy for you.",
  },
  {
    icon: MessageSquare,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
    title: "SMS Campaigns",
    desc: "Reach customers instantly with targeted SMS blasts and automated text sequences. No Twilio account needed.",
  },
  {
    icon: CreditCard,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Payments & Invoicing",
    desc: "Send professional invoices, track expenses, manage subscriptions, and view P&L reports — no QuickBooks required.",
  },
  {
    icon: CalendarDays,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Booking & Scheduling",
    desc: "Shareable booking pages that let clients self-schedule 24/7. Syncs with your calendar and sends reminders automatically.",
  },
  {
    icon: Calendar,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "Calendar",
    desc: "A full business calendar that connects your meetings, bookings, and tasks in one unified view. Never double-book.",
  },
  {
    icon: FileText,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.14)",
    title: "Proposals",
    desc: "Create, send, and e-sign professional proposals. Track when clients open them and close deals faster.",
  },
  {
    icon: Zap,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Automations",
    desc: "Build powerful cross-module workflows visually. Trigger anything from anything — no code, no Zapier.",
  },
  {
    icon: Sparkles,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "AI Assistant",
    desc: "Write emails, summarize reports, score leads, and surface hidden opportunities — all with built-in AI.",
  },
  {
    icon: MessageCircle,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
    title: "Live Chat",
    desc: "Embed a live chat widget on your site that feeds directly into your CRM. Never lose a visitor conversation.",
  },
  {
    icon: BarChart3,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
    title: "Analytics",
    desc: "Real-time dashboards across every module — revenue trends, conversion rates, campaign performance, and team KPIs.",
  },
  {
    icon: Shield,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "Team Management",
    desc: "Invite team members, assign roles and permissions, track activity, and keep everyone aligned in one workspace.",
  },
  {
    icon: HardDrive,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Storage",
    desc: "Centralized file storage for your entire business. Attach files to contacts, invoices, and proposals effortlessly.",
  },
  {
    icon: Globe,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.14)",
    title: "Client Portal",
    desc: "Give clients their own branded portal to view invoices, sign proposals, book appointments, and message your team.",
  },
  {
    icon: Plug,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
    title: "Integrations",
    desc: "Connect your favorite tools via native integrations or our open API. Stripe, Google, Slack, and hundreds more.",
  },
  {
    icon: Webhook,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "Webhooks",
    desc: "Send real-time event data to any endpoint. Build custom integrations and react to business events instantly.",
  },
];

export default function FeaturesPage() {
  return (
    <div
      style={{
        background: "#070709",
        color: "#E8E8EE",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .feat-card {
          background: #0D0D14;
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .feat-card:hover {
          border-color: rgba(245,158,11,0.2);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        }

        .feat-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.14);
          color: #E8A020;
          padding: 4px 13px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F59E0B;
          color: #0a0600;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: -0.01em;
        }
        .cta-btn:hover {
          background: #FBBF24;
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(245,158,11,0.32);
        }

        .cta-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #6666800;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.15s;
          color: #888899;
        }
        .cta-btn-ghost:hover {
          color: #E8E8EE;
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .feat-grid { grid-template-columns: 1fr !important; }
          .hide-mob { display: none !important; }
          .mob-col { flex-direction: column !important; align-items: flex-start !important; }
          .mob-center { text-align: center !important; align-items: center !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          padding: "100px 24px 80px",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div
          className="glow"
          style={{
            width: 700,
            height: 400,
            background: "rgba(245,158,11,0.05)",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="glow"
          style={{
            width: 500,
            height: 300,
            background: "rgba(99,102,241,0.035)",
            top: 0,
            right: "-5%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}
        >
          <div style={{ marginBottom: 24 }}>
            <span className="feat-badge">✦ Full Feature Overview</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(38px, 5.5vw, 70px)",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.042em",
              color: "#EEEEF4",
              marginBottom: 22,
            }}
          >
            Everything your business needs.{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #F59E0B 0%, #FBBF24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One platform.
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#44445A",
              lineHeight: 1.72,
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            Stactoro brings 16+ business tools under one roof so you can stop
            juggling subscriptions and start running your business.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/signup" className="cta-btn">
              Start free trial
              <svg
                width="15"
                height="15"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/pricing" className="cta-btn-ghost">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.042)",
          borderBottom: "1px solid rgba(255,255,255,0.042)",
          background: "#080810",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            gap: 0,
            flexWrap: "wrap",
            justifyContent: "space-around",
          }}
        >
          {[
            { n: "16+", l: "Built-in modules" },
            { n: "$400+", l: "Avg monthly savings" },
            { n: "6–8", l: "Tools replaced" },
            { n: "1", l: "Platform, one price" },
          ].map((s) => (
            <div
              key={s.l}
              style={{ padding: "8px 24px", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#EEEEF4",
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 12.5, color: "#353548", marginTop: 6 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE GRID ── */}
      <section style={{ padding: "88px 24px 96px", background: "#080810" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <span className="feat-badge" style={{ marginBottom: 16, display: "inline-flex" }}>
              Platform Modules
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 42px)",
                fontWeight: 900,
                letterSpacing: "-0.038em",
                color: "#EEEEF4",
                lineHeight: 1.08,
                marginTop: 14,
              }}
            >
              Every tool built to work together
            </h2>
            <p
              style={{
                color: "#3E3E54",
                fontSize: 15,
                marginTop: 14,
                maxWidth: 480,
                margin: "14px auto 0",
              }}
            >
              All modules share the same data. No syncing. No imports. No
              disconnected tools.
            </p>
          </div>

          <div
            className="feat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="feat-card">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: f.bg,
                      border: `1px solid ${f.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={f.color} strokeWidth={1.8} />
                  </div>
                  <h3
                    style={{
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: "#EEEEF4",
                      marginBottom: 9,
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#3E3E54",
                      lineHeight: 1.72,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARE SECTION ── */}
      <section style={{ padding: "80px 24px 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span
              className="feat-badge"
              style={{ marginBottom: 16, display: "inline-flex" }}
            >
              Replace the stack
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 40px)",
                fontWeight: 900,
                letterSpacing: "-0.038em",
                color: "#EEEEF4",
                marginTop: 14,
                lineHeight: 1.08,
              }}
            >
              One subscription. Zero compromises.
            </h2>
            <p
              style={{
                color: "#3E3E54",
                fontSize: 15,
                marginTop: 14,
              }}
            >
              Everything below is included in every Stactoro plan.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "#0D0D14",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: 16,
                padding: "28px 32px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "#C41E1E",
                  marginBottom: 20,
                  opacity: 0.8,
                }}
              >
                Without Stactoro
              </p>
              {[
                { tool: "GoHighLevel / HubSpot", cost: "$97–$800/mo" },
                { tool: "QuickBooks", cost: "$30–$90/mo" },
                { tool: "Calendly / Acuity", cost: "$16–$49/mo" },
                { tool: "Mailchimp / Klaviyo", cost: "$20–$150/mo" },
                { tool: "Twilio / SimpleTexting", cost: "$25–$75/mo" },
                { tool: "Intercom / Crisp", cost: "$39–$139/mo" },
                { tool: "Dropbox / Google Drive", cost: "$12–$30/mo" },
              ].map((r) => (
                <div
                  key={r.tool}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.035)",
                  }}
                >
                  <span style={{ fontSize: 13.5, color: "#3E3E54" }}>
                    {r.tool}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "#C41E1E",
                      fontWeight: 600,
                      opacity: 0.85,
                    }}
                  >
                    {r.cost}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  marginTop: 4,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#EEEEF4" }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#C41E1E",
                    opacity: 0.9,
                  }}
                >
                  $239–$1,333/mo
                </span>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(160deg, rgba(245,158,11,0.065) 0%, #0D0D14 60%)",
                border: "1px solid rgba(245,158,11,0.18)",
                borderRadius: 16,
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "#F59E0B",
                  marginBottom: 20,
                }}
              >
                With Stactoro
              </p>
              {[
                "CRM & Sales Pipeline",
                "Invoicing & Payments",
                "Booking & Scheduling",
                "Email Marketing",
                "SMS Campaigns",
                "Live Chat",
                "File Storage",
                "Automations",
                "AI Assistant",
                "Proposals",
                "Client Portal",
                "Analytics",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.035)",
                  }}
                >
                  <span style={{ color: "#F59E0B", fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 13.5, color: "#555568" }}>
                    {item}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  marginTop: 4,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#EEEEF4" }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#F59E0B",
                  }}
                >
                  From $49/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{ padding: "0 24px 96px", background: "#080810" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(196,30,30,0.07) 0%, rgba(245,158,11,0.055) 50%, rgba(245,158,11,0.02) 100%)",
              border: "1px solid rgba(245,158,11,0.12)",
              borderRadius: 24,
              padding: "80px 48px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="glow"
              style={{
                width: 500,
                height: 200,
                background: "rgba(245,158,11,0.05)",
                top: -60,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
            <div style={{ position: "relative" }}>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.8vw, 48px)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#EEEEF4",
                  marginBottom: 14,
                  lineHeight: 1.06,
                }}
              >
                Ready to replace your entire stack?
              </h2>
              <p
                style={{
                  color: "#3E3E54",
                  fontSize: 16,
                  maxWidth: 480,
                  margin: "0 auto 36px",
                  lineHeight: 1.7,
                }}
              >
                Start your 14-day free trial today. No credit card required.
                Cancel anytime.
              </p>
              <Link
                href="/signup"
                className="cta-btn"
                style={{ fontSize: 15, padding: "14px 36px" }}
              >
                Start free trial — no card needed
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
