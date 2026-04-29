import Link from "next/link";
import {
  Users,
  CreditCard,
  CalendarDays,
  Mail,
  Zap,
  Sparkles,
  CheckCircle,
  TrendingDown,
  Clock,
  DollarSign,
} from "lucide-react";

const coreAreas = [
  {
    icon: Users,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "CRM & Relationships",
    desc: "We built a CRM that actually works for small businesses — not bloated enterprise software retrofitted for startups. Track contacts, manage your pipeline, and never miss a follow-up.",
  },
  {
    icon: CreditCard,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Payments & Finance",
    desc: "Invoicing, expense tracking, subscriptions, and profit & loss reporting — all in one place. We replace QuickBooks for the majority of small businesses without the complexity.",
  },
  {
    icon: CalendarDays,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
    title: "Booking & Scheduling",
    desc: "Shareable booking links, automated reminders, and a synced calendar. Clients book themselves, you show up. We made Calendly redundant.",
  },
  {
    icon: Mail,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.14)",
    title: "Email & SMS Marketing",
    desc: "Design campaigns, build automated sequences, and reach customers wherever they are. AI writes the copy. You just review and send.",
  },
  {
    icon: Zap,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
    title: "Automations",
    desc: "Connect every module with visual workflows. When a deal closes, send an invoice, book an onboarding call, and trigger a welcome email — automatically.",
  },
  {
    icon: Sparkles,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.14)",
    title: "AI, Built In",
    desc: "Stactoro's AI assistant writes emails, scores leads, summarizes reports, and surfaces insights you'd otherwise miss. Not an add-on — a core part of the platform.",
  },
];

const whyPoints = [
  {
    icon: TrendingDown,
    color: "#F59E0B",
    title: "Simple",
    desc: "We obsess over simplicity. Every feature is designed to be usable within minutes, with no training required. If it's complicated, we rethink it.",
  },
  {
    icon: CheckCircle,
    color: "#22C55E",
    title: "Powerful",
    desc: "Simple doesn't mean shallow. Stactoro goes deep where it matters — automations, analytics, AI, and integrations that enterprise tools charge thousands for.",
  },
  {
    icon: DollarSign,
    color: "#818CF8",
    title: "Affordable",
    desc: "Starting at $49/month for everything. Not $49/month for the CRM, plus another $30 for email, plus another $25 for scheduling. One price, the whole platform.",
  },
  {
    icon: Clock,
    color: "#EC4899",
    title: "Ready in Minutes",
    desc: "Create your workspace, import your contacts, and send your first invoice — all in under 30 minutes. We timed it. The average setup is 12 minutes.",
  },
];

const toolsReplaced = [
  { tool: "GoHighLevel", category: "CRM / Marketing" },
  { tool: "QuickBooks", category: "Accounting" },
  { tool: "Calendly", category: "Scheduling" },
  { tool: "Mailchimp", category: "Email Marketing" },
  { tool: "Twilio", category: "SMS" },
  { tool: "HubSpot", category: "CRM" },
  { tool: "Intercom", category: "Live Chat" },
  { tool: "Dropbox", category: "File Storage" },
];

export default function AboutPage() {
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

        .about-card {
          background: #0D0D14;
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.22s, transform 0.22s;
        }
        .about-card:hover {
          border-color: rgba(245,158,11,0.2);
          transform: translateY(-2px);
        }

        .about-badge {
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

        .tool-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 10px;
          padding: 12px 16px;
          transition: border-color 0.2s;
        }
        .tool-chip:hover {
          border-color: rgba(196,30,30,0.25);
        }

        @media (max-width: 768px) {
          .about-grid-3 { grid-template-columns: 1fr !important; }
          .about-grid-2 { grid-template-columns: 1fr !important; }
          .about-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .hide-mob { display: none !important; }
          .mob-center { text-align: center !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          padding: "100px 24px 88px",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div
          className="glow"
          style={{
            width: 700,
            height: 400,
            background: "rgba(245,158,11,0.045)",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="glow"
          style={{
            width: 400,
            height: 250,
            background: "rgba(196,30,30,0.035)",
            top: 40,
            right: "5%",
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
            <span className="about-badge">✦ Our Story</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5.2vw, 68px)",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.042em",
              color: "#EEEEF4",
              marginBottom: 24,
            }}
          >
            We built the platform{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #F59E0B 0%, #FBBF24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              we wished existed.
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "#44445A",
              lineHeight: 1.75,
              maxWidth: 620,
              margin: "0 auto 20px",
            }}
          >
            We were running a business and paying for 7 different tools that
            didn&apos;t talk to each other. QuickBooks for invoices. Calendly for
            bookings. Mailchimp for email. HubSpot for CRM. Twilio for SMS.
            Intercom for chat. Zapier to connect them all.
          </p>
          <p
            style={{
              fontSize: 17,
              color: "#44445A",
              lineHeight: 1.75,
              maxWidth: 620,
              margin: "0 auto 40px",
            }}
          >
            It was expensive, fragmented, and exhausting. So we built
            Stactoro — one platform that does all of it, better.
          </p>
        </div>
      </section>

      {/* ── MISSION STATEMENT ── */}
      <section
        style={{ padding: "0 24px 88px", background: "#080810" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.055) 0%, rgba(99,102,241,0.04) 100%)",
              border: "1px solid rgba(245,158,11,0.12)",
              borderRadius: 20,
              padding: "52px 52px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="glow"
              style={{
                width: 400,
                height: 200,
                background: "rgba(245,158,11,0.04)",
                top: -60,
                right: "-5%",
              }}
            />
            <div style={{ position: "relative", maxWidth: 700 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "#F59E0B",
                  marginBottom: 16,
                }}
              >
                Our Mission
              </p>
              <p
                style={{
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 700,
                  color: "#EEEEF4",
                  lineHeight: 1.5,
                  letterSpacing: "-0.02em",
                  marginBottom: 20,
                }}
              >
                &ldquo;Replace the 6–8 tools every small business is paying for with a
                single, cohesive platform — saving $400+ per month and
                eliminating the complexity of a disconnected stack.&rdquo;
              </p>
              <p style={{ fontSize: 14, color: "#3E3E54", lineHeight: 1.7 }}>
                Stactoro replaces GoHighLevel, QuickBooks, Calendly, Mailchimp,
                Twilio, HubSpot, Intercom, and more. Not as a feature-list
                gimmick, but because we&apos;ve rebuilt every one of these tools from
                scratch — designed to work together from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS REPLACED ── */}
      <section style={{ padding: "80px 24px", background: "#080810" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              className="about-badge"
              style={{ marginBottom: 16, display: "inline-flex" }}
            >
              What we replace
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
              Cancel these subscriptions
            </h2>
            <p style={{ color: "#3E3E54", fontSize: 15, marginTop: 12 }}>
              Businesses switching to Stactoro save an average of $400+/month.
            </p>
          </div>

          <div
            className="about-grid-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 32,
            }}
          >
            {toolsReplaced.map((t) => (
              <div key={t.tool} className="tool-chip">
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#555568",
                      textDecoration: "line-through",
                      textDecorationColor: "rgba(196,30,30,0.5)",
                    }}
                  >
                    {t.tool}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2E2E40",
                      marginTop: 3,
                    }}
                  >
                    {t.category}
                  </div>
                </div>
                <span
                  style={{
                    color: "#C41E1E",
                    opacity: 0.7,
                    fontSize: 14,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.14)",
                borderRadius: 12,
                padding: "14px 28px",
              }}
            >
              <span style={{ color: "#F59E0B", fontSize: 18, fontWeight: 900 }}>
                →
              </span>
              <span
                style={{ fontSize: 14, fontWeight: 700, color: "#EEEEF4" }}
              >
                Stactoro
              </span>
              <span style={{ fontSize: 13, color: "#555568" }}>
                — everything above, starting at $49/mo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section style={{ padding: "88px 24px 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <span
              className="about-badge"
              style={{ marginBottom: 16, display: "inline-flex" }}
            >
              What we do
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 42px)",
                fontWeight: 900,
                letterSpacing: "-0.038em",
                color: "#EEEEF4",
                marginTop: 14,
                lineHeight: 1.08,
                maxWidth: 540,
              }}
            >
              Six core areas. One connected platform.
            </h2>
            <p
              style={{
                color: "#3E3E54",
                fontSize: 15,
                marginTop: 14,
                maxWidth: 540,
              }}
            >
              Every module shares the same data. Your CRM contacts are your
              invoice customers are your booked clients. No syncing, no CSV
              imports.
            </p>
          </div>

          <div
            className="about-grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {coreAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.title} className="about-card">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: area.bg,
                      border: `1px solid ${area.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                    }}
                  >
                    <Icon size={20} color={area.color} strokeWidth={1.8} />
                  </div>
                  <h3
                    style={{
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: "#EEEEF4",
                      marginBottom: 10,
                    }}
                  >
                    {area.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#3E3E54",
                      lineHeight: 1.72,
                    }}
                  >
                    {area.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY STACTORO ── */}
      <section
        style={{ padding: "80px 24px 96px", background: "#080810" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span
              className="about-badge"
              style={{ marginBottom: 16, display: "inline-flex" }}
            >
              Why Stactoro
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 42px)",
                fontWeight: 900,
                letterSpacing: "-0.038em",
                color: "#EEEEF4",
                marginTop: 14,
                lineHeight: 1.08,
              }}
            >
              Simple. Powerful. Affordable.
            </h2>
            <p style={{ color: "#3E3E54", fontSize: 15, marginTop: 12 }}>
              Three words we never compromise on.
            </p>
          </div>

          <div
            className="about-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {whyPoints.map((pt) => {
              const Icon = pt.icon;
              return (
                <div
                  key={pt.title}
                  className="about-card"
                  style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={pt.color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: "#EEEEF4",
                        marginBottom: 9,
                      }}
                    >
                      {pt.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13.5,
                        color: "#3E3E54",
                        lineHeight: 1.72,
                      }}
                    >
                      {pt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TEAM NOTE ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <span
            className="about-badge"
            style={{ marginBottom: 20, display: "inline-flex" }}
          >
            Who we are
          </span>
          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: "#EEEEF4",
              lineHeight: 1.1,
              marginTop: 14,
              marginBottom: 20,
            }}
          >
            A small team building something big
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#3E3E54",
              lineHeight: 1.78,
              marginBottom: 16,
            }}
          >
            Stactoro is built by a small, focused team of engineers and
            designers who have worked in startups, agencies, and enterprises.
            We know what it feels like to pay for 10 SaaS tools that don&apos;t
            talk to each other. We know the pain of exporting CSVs to sync
            data between platforms.
          </p>
          <p
            style={{
              fontSize: 15,
              color: "#3E3E54",
              lineHeight: 1.78,
            }}
          >
            We&apos;re building Stactoro to be the platform we&apos;ve always wanted to
            use. Every feature, every design decision, every pricing tier is
            made with one question in mind: does this make running a business
            easier and more affordable?
          </p>
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
                background: "rgba(245,158,11,0.045)",
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
                Start building smarter today.
              </h2>
              <p
                style={{
                  color: "#3E3E54",
                  fontSize: 16,
                  maxWidth: 460,
                  margin: "0 auto 36px",
                  lineHeight: 1.7,
                }}
              >
                Join businesses already saving $400+ per month. 14-day free
                trial. No credit card required.
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
                <Link href="/features" className="cta-btn-ghost">
                  Explore features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
