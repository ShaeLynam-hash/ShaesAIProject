import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return <LandingPage />;
}

function LandingPage() {
  return (
    <div
      style={{
        "--obs-bg": "#08080A",
        "--obs-surface": "#111114",
        "--obs-elevated": "#18181C",
        "--obs-border": "#25252B",
        "--obs-text": "#F2F2F5",
        "--obs-muted": "#6B6B76",
        "--obs-accent": "#6366F1",
        "--obs-accent-2": "#818CF8",
        "--obs-success": "#22C55E",
        backgroundColor: "var(--obs-bg)",
        color: "var(--obs-text)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
      } as React.CSSProperties}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(8, 8, 10, 0.8);
          border-bottom: 1px solid var(--obs-border);
        }

        .hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(37, 37, 43, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 37, 43, 0.4) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #F2F2F5 0%, #A5B4FC 60%, #818CF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: var(--obs-accent);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          background: #5558e8;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }

        .btn-ghost {
          background: transparent;
          color: var(--obs-text);
          border: 1px solid var(--obs-border);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-ghost:hover {
          border-color: var(--obs-accent-2);
          color: var(--obs-accent-2);
          background: rgba(99, 102, 241, 0.05);
        }

        .btn-sm-ghost {
          background: transparent;
          color: var(--obs-muted);
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .btn-sm-ghost:hover {
          color: var(--obs-text);
          background: rgba(255,255,255,0.05);
        }

        .btn-sm-primary {
          background: var(--obs-accent);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .btn-sm-primary:hover {
          background: #5558e8;
        }

        .feature-card {
          background: var(--obs-surface);
          border: 1px solid var(--obs-border);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s ease;
        }
        .feature-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: var(--obs-elevated);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99, 102, 241, 0.15);
        }

        .pricing-card {
          background: var(--obs-surface);
          border: 1px solid var(--obs-border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.25s ease;
          position: relative;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .pricing-card.featured {
          border-color: var(--obs-accent);
          background: linear-gradient(180deg, rgba(99,102,241,0.08) 0%, var(--obs-surface) 100%);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 20px 60px rgba(99,102,241,0.15);
        }

        .testimonial-card {
          background: var(--obs-surface);
          border: 1px solid var(--obs-border);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s ease;
        }
        .testimonial-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--obs-accent-2);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .popular-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--obs-accent);
          color: white;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: var(--obs-muted);
          line-height: 1.5;
        }
        .check-icon {
          color: var(--obs-success);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 32px;
          font-weight: 800;
          color: var(--obs-text);
          line-height: 1;
        }
        .stat-label {
          font-size: 13px;
          color: var(--obs-muted);
          margin-top: 4px;
          font-weight: 500;
        }

        .nav-link {
          color: var(--obs-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--obs-text); }

        .divider {
          width: 1px;
          height: 16px;
          background: var(--obs-border);
        }

        .section-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--obs-accent-2);
        }

        .price-amount {
          font-size: 52px;
          font-weight: 900;
          color: var(--obs-text);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .price-period {
          font-size: 16px;
          color: var(--obs-muted);
          font-weight: 500;
        }

        .stars {
          color: #FBBF24;
          font-size: 16px;
          letter-spacing: 2px;
        }

        .quote-mark {
          font-size: 48px;
          color: var(--obs-accent);
          line-height: 0.5;
          font-family: Georgia, serif;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-stack { flex-direction: column !important; }
          .mobile-full { width: 100% !important; }
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header
        className="nav-glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <nav
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--obs-accent)" }}>✦</span>
            <span style={{ color: "var(--obs-text)", marginLeft: 6 }}>Luminary</span>
          </Link>

          {/* Center links */}
          <div
            className="hide-mobile"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Link href="#features" className="nav-link" style={{ padding: "8px 12px" }}>Features</Link>
            <Link href="#pricing" className="nav-link" style={{ padding: "8px 12px" }}>Pricing</Link>
            <Link href="#about" className="nav-link" style={{ padding: "8px 12px" }}>About</Link>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" className="btn-sm-ghost">Sign in</Link>
            <Link href="/register" className="btn-sm-primary">Start free trial</Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="grid-bg"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "120px 24px 100px",
          textAlign: "center",
        }}
      >
        <div className="hero-glow" />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <div style={{ marginBottom: 28 }}>
            <span className="badge">✦ All-in-one business platform</span>
          </div>

          {/* H1 */}
          <h1
            className="gradient-text"
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: 24,
            }}
          >
            Run your entire business from one place
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--obs-muted)",
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 640,
              margin: "0 auto 40px",
            }}
          >
            Luminary replaces QuickBooks, Calendly, Mailchimp, HubSpot, and Twilio —
            giving your business everything it needs in one beautiful platform.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 64,
            }}
          >
            <Link href="/register" className="btn-primary">
              Start free trial
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="#demo" className="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
              </svg>
              Watch demo
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              flexWrap: "wrap",
              paddingTop: 40,
              borderTop: "1px solid var(--obs-border)",
            }}
          >
            <div className="stat-item">
              <div className="stat-number">16+</div>
              <div className="stat-label">modules</div>
            </div>
            <div className="divider" style={{ alignSelf: "center", height: 40 }} />
            <div className="stat-item">
              <div className="stat-number">1</div>
              <div className="stat-label">platform</div>
            </div>
            <div className="divider" style={{ alignSelf: "center", height: 40 }} />
            <div className="stat-item">
              <div className="stat-number">$0</div>
              <div className="stat-label">extra subscriptions needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>Features</p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--obs-text)",
              lineHeight: 1.15,
            }}
          >
            Everything your business needs
          </h2>
          <p style={{ color: "var(--obs-muted)", marginTop: 14, fontSize: 17, maxWidth: 480, margin: "14px auto 0" }}>
            One subscription. Every tool you need. Zero juggling.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              icon: "💳",
              title: "Payments & Invoicing",
              desc: "Send invoices, track expenses, view P&L reports",
            },
            {
              icon: "📅",
              title: "Booking & Scheduling",
              desc: "Let clients book appointments online, 24/7",
            },
            {
              icon: "👥",
              title: "CRM & Pipeline",
              desc: "Manage contacts, deals, and your sales pipeline",
            },
            {
              icon: "📧",
              title: "Email & SMS",
              desc: "Send campaigns and automations to your customers",
            },
            {
              icon: "🤖",
              title: "AI Assistant",
              desc: "Built-in AI to write emails, analyze data, and more",
            },
            {
              icon: "📊",
              title: "Analytics & Reports",
              desc: "Real-time insights into every part of your business",
            },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  background: "rgba(99, 102, 241, 0.1)",
                  borderRadius: 12,
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--obs-text)",
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "var(--obs-muted)", fontSize: 14, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "100px 24px",
          background: "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.03) 50%, transparent 100%)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Pricing</p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--obs-text)",
                lineHeight: 1.15,
              }}
            >
              Simple, honest pricing
            </h2>
            <p style={{ color: "var(--obs-muted)", marginTop: 14, fontSize: 17 }}>
              14-day free trial. No credit card required.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* Starter */}
            <div className="pricing-card">
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--obs-text)", marginBottom: 6 }}>Starter</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span className="price-amount">$49</span>
                  <span className="price-period">/mo</span>
                </div>
                <p style={{ color: "var(--obs-muted)", fontSize: 13, marginTop: 6 }}>For small businesses getting started</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Up to 3 team members",
                  "All core modules",
                  "1,000 email sends/mo",
                  "Basic analytics",
                  "Email support",
                ].map((f) => (
                  <div key={f} className="check-item">
                    <span className="check-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="rgba(34,197,94,0.15)"/>
                        <path d="M4.5 8l2.5 2.5 4-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="pricing-card featured" style={{ marginTop: -16 }}>
              <div className="popular-badge">Most Popular</div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--obs-text)", marginBottom: 6 }}>Pro</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span className="price-amount">$99</span>
                  <span className="price-period">/mo</span>
                </div>
                <p style={{ color: "var(--obs-muted)", fontSize: 13, marginTop: 6 }}>For growing teams that need more</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Up to 10 team members",
                  "All modules + AI assistant",
                  "10,000 email sends/mo",
                  "Advanced analytics + reports",
                  "Priority support",
                  "Custom branding",
                ].map((f) => (
                  <div key={f} className="check-item">
                    <span className="check-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="rgba(34,197,94,0.15)"/>
                        <path d="M4.5 8l2.5 2.5 4-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card">
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--obs-text)", marginBottom: 6 }}>Enterprise</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span className="price-amount">$249</span>
                  <span className="price-period">/mo</span>
                </div>
                <p style={{ color: "var(--obs-muted)", fontSize: 13, marginTop: 6 }}>For large organizations at scale</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Unlimited team members",
                  "Everything in Pro",
                  "Unlimited emails",
                  "Dedicated account manager",
                  "SLA guarantee",
                  "White-label option",
                ].map((f) => (
                  <div key={f} className="check-item">
                    <span className="check-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="rgba(34,197,94,0.15)"/>
                        <path d="M4.5 8l2.5 2.5 4-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────── */}
      <section id="about" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Testimonials</p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--obs-text)",
                lineHeight: 1.15,
              }}
            >
              Trusted by businesses worldwide
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                quote: "Luminary replaced 6 different subscriptions for us. We save $400/month and everything is finally in one place.",
                name: "Sarah M.",
                role: "Boutique Owner",
                initials: "SM",
              },
              {
                quote: "The booking system alone is worth it. My clients love how easy it is to schedule, and I never get double-booked.",
                name: "James K.",
                role: "Personal Trainer",
                initials: "JK",
              },
              {
                quote: "Finally, an all-in-one that actually works. Setup took 10 minutes and I was sending invoices the same day.",
                name: "Priya L.",
                role: "Consultant",
                initials: "PL",
              },
            ].map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{ marginBottom: 16 }}>
                  <span className="stars">★★★★★</span>
                </div>
                <div className="quote-mark">&ldquo;</div>
                <p style={{ color: "var(--obs-text)", fontSize: 15, lineHeight: 1.7, marginBottom: 24, marginTop: 8 }}>
                  {t.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--obs-accent) 0%, var(--obs-accent-2) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--obs-text)" }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: "var(--obs-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          margin: "0 24px 80px",
          maxWidth: 1100,
          marginLeft: "auto",
          marginRight: "auto",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(129,140,248,0.06) 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 24,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 800,
            color: "var(--obs-text)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Ready to simplify your business?
        </h2>
        <p style={{ color: "var(--obs-muted)", fontSize: 17, marginBottom: 32 }}>
          Join thousands of businesses running on Luminary. Start your 14-day free trial today.
        </p>
        <Link href="/register" className="btn-primary" style={{ fontSize: 16, padding: "14px 28px" }}>
          Start free trial — no credit card required
        </Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--obs-border)",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 32,
          }}
        >
          {/* Logo + tagline */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>
              <span style={{ color: "var(--obs-accent)" }}>✦</span>
              <span style={{ color: "var(--obs-text)", marginLeft: 6 }}>Luminary</span>
            </div>
            <p style={{ color: "var(--obs-muted)", fontSize: 14, lineHeight: 1.6 }}>
              The last business platform you&apos;ll ever need.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "var(--obs-muted)", textTransform: "uppercase", marginBottom: 14 }}>
                Product
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="#features" className="nav-link" style={{ fontSize: 14 }}>Features</Link>
                <Link href="#pricing" className="nav-link" style={{ fontSize: 14 }}>Pricing</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "var(--obs-muted)", textTransform: "uppercase", marginBottom: 14 }}>
                Account
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/login" className="nav-link" style={{ fontSize: 14 }}>Sign In</Link>
                <Link href="/register" className="nav-link" style={{ fontSize: 14 }}>Sign Up</Link>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: "32px auto 0",
            paddingTop: 24,
            borderTop: "1px solid var(--obs-border)",
            color: "var(--obs-muted)",
            fontSize: 13,
          }}
        >
          &copy; 2026 Luminary. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
