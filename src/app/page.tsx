"use client";
import Link from "next/link";

export default function Home() {
  return <LandingPage />;
}

function LandingPage() {
  return (
    <div style={{
      background: "#06060A",
      color: "#E8E8EE",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #06060A; }
        ::-webkit-scrollbar-thumb { background: #1E1E2A; border-radius: 4px; }

        .nav-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(6,6,10,0.82);
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #F59E0B;
          color: #0a0600;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .btn-primary:hover {
          background: #FBBF24;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(245,158,11,0.28);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          color: #8888A0;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.09);
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-secondary:hover {
          color: #E8E8EE;
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.04);
        }

        .nav-link {
          color: #5A5A6E;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .nav-link:hover { color: #E8E8EE; }

        .badge {
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

        .feature-card {
          background: #0D0D14;
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.22s, transform 0.22s;
        }
        .feature-card:hover {
          border-color: rgba(245,158,11,0.18);
          transform: translateY(-2px);
        }

        .icon-box {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .pricing-card {
          background: #0D0D14;
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 20px;
          padding: 32px;
          position: relative;
          transition: all 0.2s;
        }
        .pricing-card.hot {
          border-color: rgba(245,158,11,0.28);
          background: linear-gradient(180deg, rgba(245,158,11,0.055) 0%, #0D0D14 55%);
        }

        .check-li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: #555568;
          padding: 4px 0;
        }
        .check-li .chk { color: #F59E0B; font-size: 13px; }

        .quote-card {
          background: #0D0D14;
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 16px;
          padding: 26px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.065);
          color: #55556A;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-inner {
          display: inline-flex;
          animation: ticker 32s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .step-line {
          position: absolute;
          top: 21px;
          left: calc(50% + 21px);
          width: calc(100% - 42px);
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        @media (max-width: 768px) {
          .hide-mob { display: none !important; }
          .mob-col { flex-direction: column !important; }
          .mob-full { grid-column: span 1 !important; width: 100% !important; }
          .mob-center { text-align: center !important; }
        }
      `}</style>

      {/* ─────────────────────── NAVBAR ─────────────────────── */}
      <header className="nav-blur" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stactoro-logo-wide.jpg" alt="Stactoro" style={{ height: 36, width: "auto", objectFit: "contain" }} />
          </Link>

          <div className="hide-mob" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#reviews" className="nav-link">Reviews</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/login" className="nav-link" style={{ padding: "6px 14px" }}>Sign in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Start free</Link>
          </div>
        </nav>
      </header>

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section style={{ position: "relative", padding: "104px 24px 88px", overflow: "hidden" }}>
        <div className="glow" style={{ width: 800, height: 450, background: "rgba(196,30,30,0.045)", top: -120, left: "18%", transform: "translateX(-50%)" }} />
        <div className="glow" style={{ width: 600, height: 350, background: "rgba(245,158,11,0.04)", top: -40, right: "-8%" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ marginBottom: 28 }}>
            <span className="badge">✦ AI-Powered Business Platform</span>
          </div>

          <h1 style={{ fontSize: "clamp(44px, 6.8vw, 82px)", fontWeight: 900, lineHeight: 1.025, letterSpacing: "-0.045em", color: "#EEEEف4", maxWidth: 840, marginBottom: 26 }}>
            Run your entire business{" "}
            <span style={{
              background: "linear-gradient(120deg, #F59E0B 0%, #FBBF24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>from one place.</span>
          </h1>

          <div style={{ display: "flex", gap: 60, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 72 }} className="mob-col">
            <p style={{ fontSize: 17, color: "#4E4E62", lineHeight: 1.75, maxWidth: 500, flex: "1 1 300px" }}>
              Stactoro replaces QuickBooks, Calendly, Mailchimp, HubSpot, and Twilio — with one intelligent platform that keeps your entire business in sync.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: "0 0 auto" }}>
              <Link href="/signup" className="btn-primary">
                Start your 14-day free trial
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#features" className="btn-secondary" style={{ justifyContent: "center" }}>
                Explore features
              </a>
              <p style={{ fontSize: 11, color: "#2E2E3E", textAlign: "center" }}>No credit card required · Cancel anytime</p>
            </div>
          </div>

          {/* ── App mockup ── */}
          <div style={{ position: "relative", marginBottom: 80 }}>
            <div style={{ position: "absolute", inset: "-40px -80px", background: "radial-gradient(ellipse at 50% 60%, rgba(245,158,11,0.065) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 36px 110px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.03)", position: "relative" }}>
              <div style={{ background: "#111118", padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#22C55E" }} />
                <div style={{ flex: 1, margin: "0 16px", background: "rgba(255,255,255,0.045)", borderRadius: 5, padding: "3px 12px", fontSize: 11, color: "#2E2E3E" }}>
                  app.stactoro.com/dashboard
                </div>
              </div>
              <div style={{ background: "#09090E", display: "flex", height: 410 }}>
                <div style={{ width: 194, background: "#07070C", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "18px 10px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 14 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/stactoro-icon.jpg" alt="" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 4 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#DDDDE8", letterSpacing: "-0.015em" }}>Stactoro</span>
                  </div>
                  {[
                    { label: "Dashboard",   active: true,  dot: "#F59E0B" },
                    { label: "Payments",    active: false, dot: "#22C55E" },
                    { label: "CRM",         active: false, dot: "#6366F1" },
                    { label: "Scheduling",  active: false, dot: "#F59E0B" },
                    { label: "Inbox",       active: false, dot: "#EC4899" },
                    { label: "AI Brain",    active: false, dot: "#818CF8" },
                    { label: "Email",       active: false, dot: "#8B5CF6" },
                    { label: "Automations", active: false, dot: "#F59E0B" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", borderRadius: 7, background: item.active ? "rgba(245,158,11,0.08)" : "transparent" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.active ? item.dot : "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: item.active ? "#DDDDE8" : "#303040", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: "20px 22px", overflow: "hidden" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#EEEEF4", marginBottom: 3 }}>Good afternoon 👋</div>
                  <div style={{ fontSize: 11, color: "#2E2E40", marginBottom: 18 }}>Here&apos;s your business overview</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                    {[
                      { l: "Contacts",  v: "142",   c: "#6366F1" },
                      { l: "Revenue",   v: "$8.4k",  c: "#22C55E" },
                      { l: "Bookings",  v: "23",    c: "#F59E0B" },
                      { l: "Campaigns", v: "7",     c: "#8B5CF6" },
                    ].map(s => (
                      <div key={s.l} style={{ background: "#0F0F18", border: "1px solid rgba(255,255,255,0.045)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: `${s.c}18`, marginBottom: 7 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontSize: 9.5, color: "#272734", marginTop: 3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: "#0F0F18", border: "1px solid rgba(255,255,255,0.045)", borderRadius: 10, padding: "11px 13px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#DDDDE8", marginBottom: 9 }}>Recent Contacts</div>
                      {["Sarah M.", "James K.", "Priya L.", "Alex R."].map((n, i) => (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                          <div style={{ width: 17, height: 17, borderRadius: "50%", background: ["#6366F1","#22C55E","#F59E0B","#EC4899"][i], opacity: 0.7, flexShrink: 0 }} />
                          <span style={{ fontSize: 10.5, color: "#3A3A50" }}>{n}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0F0F18", border: "1px solid rgba(255,255,255,0.045)", borderRadius: 10, padding: "11px 13px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#DDDDE8", marginBottom: 9 }}>Sales Pipeline</div>
                      {[
                        { l: "Qualified",   w: "78%", c: "#818CF8" },
                        { l: "Proposal",    w: "54%", c: "#F59E0B" },
                        { l: "Negotiation", w: "36%", c: "#EC4899" },
                        { l: "Closed Won",  w: "91%", c: "#22C55E" },
                      ].map(b => (
                        <div key={b.l} style={{ marginBottom: 7 }}>
                          <div style={{ fontSize: 9.5, color: "#2C2C3C", marginBottom: 3 }}>{b.l}</div>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                            <div style={{ height: "100%", width: b.w, background: b.c, borderRadius: 99, opacity: 0.7 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 40, flexWrap: "wrap" }}>
            {[
              { n: "16+",    l: "Built-in modules" },
              { n: "$400+",  l: "Average monthly savings" },
              { n: "14 day", l: "Free trial, no card" },
              { n: "1",      l: "Platform for everything" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 160px", paddingRight: 28, marginBottom: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: "#EEEEF4", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "#353548", marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── TICKER ─────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.042)", borderBottom: "1px solid rgba(255,255,255,0.042)", padding: "12px 0", background: "#080810" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {["QuickBooks","Calendly","Mailchimp","HubSpot","Twilio","Stripe Billing","Typeform","Intercom","Gusto","Dropbox","Monday.com","Zapier","Salesforce"].map(t => (
                  <span key={t} style={{ padding: "0 26px", color: "#252535", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                    {t} <span style={{ color: "#C41E1E", marginLeft: 6, opacity: 0.8 }}>✕</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
      <section style={{ padding: "96px 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-flex" }}>How It Works</span>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 900, letterSpacing: "-0.038em", color: "#EEEEF4", lineHeight: 1.08, marginTop: 14 }}>
              Up and running in minutes
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, position: "relative" }}>
            {[
              { n: "1", title: "Create your workspace", body: "Sign up, give your business a name, and your platform is ready. No complicated setup.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              )},
              { n: "2", title: "Connect your tools", body: "Import your contacts, set up payments, and connect your email. Everything syncs automatically.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              )},
              { n: "3", title: "Let AI do the rest", body: "Stactoro's AI learns your business, writes your emails, flags opportunities, and automates follow-ups.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
                </svg>
              )},
            ].map((step, i) => (
              <div key={i} style={{ padding: "0 28px", textAlign: "center", position: "relative" }}>
                {i < 2 && <div className="step-line hide-mob" />}
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Step {step.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: "#3E3E54", lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section id="features" style={{ padding: "80px 24px 96px", background: "#080810" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-flex" }}>Platform</span>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 900, letterSpacing: "-0.038em", color: "#EEEEF4", lineHeight: 1.08, marginTop: 14, maxWidth: 560 }}>
              Every tool built to work together
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>

            {/* Payments — 2 cols */}
            <div className="feature-card mob-full" style={{ gridColumn: "span 2", padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div className="icon-box" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.12)", marginBottom: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EEEEF4" }}>Payments & Invoicing</h3>
              </div>
              <p style={{ color: "#3E3E54", fontSize: 14, lineHeight: 1.78, marginBottom: 22 }}>
                Send professional invoices in seconds, track expenses by category, view profit & loss reports, and manage recurring subscriptions — all without QuickBooks.
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Invoices","Expenses","P&L Reports","Subscriptions","Customers"].map(t => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>

            {/* Booking */}
            <div className="feature-card" style={{ padding: 28 }}>
              <div className="icon-box" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>Booking & Scheduling</h3>
              <p style={{ color: "#3E3E54", fontSize: 13.5, lineHeight: 1.7 }}>
                Shareable booking pages. Clients self-schedule 24/7. No more back-and-forth.
              </p>
            </div>

            {/* CRM */}
            <div className="feature-card" style={{ padding: 28 }}>
              <div className="icon-box" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>CRM & Sales Pipeline</h3>
              <p style={{ color: "#3E3E54", fontSize: 13.5, lineHeight: 1.7 }}>
                Track every contact, deal, and follow-up. Close more and never lose a lead again.
              </p>
            </div>

            {/* Email & SMS — 2 cols */}
            <div className="feature-card mob-full" style={{ gridColumn: "span 2", padding: 32, display: "flex", alignItems: "flex-start", gap: 36 }}>
              <div style={{ flex: 1 }}>
                <div className="icon-box" style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.11)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>Email & SMS Campaigns</h3>
                <p style={{ color: "#3E3E54", fontSize: 14, lineHeight: 1.78 }}>
                  Design campaigns and automations that run while you sleep. AI writes the copy so you don&apos;t have to.
                </p>
              </div>
              <div className="hide-mob" style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 7, paddingTop: 4 }}>
                {["Welcome series","Abandoned cart","Re-engagement","Weekly digest"].map(t => (
                  <div key={t} style={{ background: "rgba(236,72,153,0.055)", border: "1px solid rgba(236,72,153,0.1)", borderRadius: 8, padding: "7px 13px", fontSize: 12, color: "#EC4899", fontWeight: 500 }}>
                    ✓ {t}
                  </div>
                ))}
              </div>
            </div>

            {/* AI */}
            <div className="feature-card" style={{ padding: 28, background: "linear-gradient(160deg, rgba(99,102,241,0.065) 0%, #0D0D14 100%)", borderColor: "rgba(99,102,241,0.1)" }}>
              <div className="icon-box" style={{ background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.14)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>AI Assistant</h3>
              <p style={{ color: "#3E3E54", fontSize: 13.5, lineHeight: 1.7 }}>
                Write emails, analyze sales, summarize reports, and surface insights — all with built-in AI.
              </p>
            </div>

            {/* Analytics */}
            <div className="feature-card" style={{ padding: 28 }}>
              <div className="icon-box" style={{ background: "rgba(34,197,94,0.065)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>Analytics & Reports</h3>
              <p style={{ color: "#3E3E54", fontSize: 13.5, lineHeight: 1.7 }}>
                Real-time dashboards across every module. Revenue trends, conversion rates, team KPIs.
              </p>
            </div>

            {/* Automations */}
            <div className="feature-card" style={{ padding: 28 }}>
              <div className="icon-box" style={{ background: "rgba(245,158,11,0.065)", border: "1px solid rgba(245,158,11,0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#EEEEF4", marginBottom: 9 }}>Automations</h3>
              <p style={{ color: "#3E3E54", fontSize: 13.5, lineHeight: 1.7 }}>
                Build cross-module workflows visually. Trigger anything from anything. Zero code.
              </p>
            </div>

            {/* Everything else */}
            <div className="feature-card" style={{ gridColumn: "span 3", padding: 22 }}>
              <p style={{ fontSize: 10.5, color: "#2E2E40", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 13 }}>And everything else, already built in</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {["Support Tickets","HR & Employees","Document Editor","Calendar","File Storage","Webhooks","Forms Builder","Client Portal","Team Management","API Keys","2FA Security","White Label","Database Browser"].map(t => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── PRICING ─────────────────────── */}
      <section id="pricing" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-flex" }}>Pricing</span>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 900, letterSpacing: "-0.038em", color: "#EEEEF4", marginTop: 14, lineHeight: 1.08 }}>
              Simple, transparent pricing.
            </h2>
            <p style={{ color: "#3E3E54", marginTop: 12, fontSize: 15 }}>14-day free trial on every plan. No credit card required.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 14, alignItems: "start" }}>
            <div className="pricing-card">
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3E3E54", marginBottom: 20 }}>Starter</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: "#EEEEF4", lineHeight: 1 }}>$49</span>
                <span style={{ color: "#2E2E40", fontSize: 14 }}>/mo</span>
              </div>
              <p style={{ color: "#2E2E40", fontSize: 13, marginBottom: 24 }}>For solo founders & small teams</p>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                {["Up to 3 team members","All core modules","1,000 emails/mo","Basic analytics","Email support"].map(f => (
                  <div key={f} className="check-li"><span className="chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>Start free trial</Link>
            </div>

            <div className="pricing-card hot" style={{ marginTop: -12 }}>
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0a0600", padding: "3px 14px", borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F59E0B", marginBottom: 20 }}>Pro</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: "#EEEEF4", lineHeight: 1 }}>$99</span>
                <span style={{ color: "#2E2E40", fontSize: 14 }}>/mo</span>
              </div>
              <p style={{ color: "#2E2E40", fontSize: 13, marginBottom: 24 }}>For growing teams that need more</p>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                {["Up to 10 team members","All modules + AI assistant","10,000 emails/mo","Advanced analytics & reports","Priority support","Custom branding"].map(f => (
                  <div key={f} className="check-li"><span className="chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Start free trial</Link>
            </div>

            <div className="pricing-card">
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3E3E54", marginBottom: 20 }}>Enterprise</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: "#EEEEF4", lineHeight: 1 }}>$249</span>
                <span style={{ color: "#2E2E40", fontSize: 14 }}>/mo</span>
              </div>
              <p style={{ color: "#2E2E40", fontSize: 13, marginBottom: 24 }}>For organizations at scale</p>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                {["Unlimited team members","Everything in Pro","Unlimited emails","Dedicated account manager","SLA guarantee","White-label option"].map(f => (
                  <div key={f} className="check-li"><span className="chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>Contact sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      <section id="reviews" style={{ padding: "96px 24px", background: "#080810" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-flex" }}>Customer Stories</span>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 900, letterSpacing: "-0.038em", color: "#EEEEF4", marginTop: 14, lineHeight: 1.08 }}>
              Businesses running on Stactoro
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 12 }}>
            {[
              { q: "Stactoro replaced 6 different subscriptions for us. We save $400/month and everything is finally in one place.", name: "Sarah M.", role: "Boutique Owner", c: "#F59E0B" },
              { q: "The booking system alone is worth it. My clients love how easy it is to schedule. I never get double-booked anymore.", name: "James K.", role: "Personal Trainer", c: "#818CF8" },
              { q: "Finally, an all-in-one that actually works. Setup took 10 minutes and I was sending invoices the same day.", name: "Priya L.", role: "Consultant", c: "#22C55E" },
            ].map((t, i) => (
              <div key={i} className="quote-card">
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#F59E0B", fontSize: 13 }}>★</span>)}
                </div>
                <p style={{ color: "#B8B8C8", fontSize: 14, lineHeight: 1.78, marginBottom: 22 }}>&ldquo;{t.q}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#0a0600", flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#EEEEF4" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#2E2E40" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA ─────────────────────── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(196,30,30,0.07) 0%, rgba(245,158,11,0.055) 50%, rgba(245,158,11,0.02) 100%)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 24, padding: "80px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div className="glow" style={{ width: 500, height: 200, background: "rgba(245,158,11,0.045)", top: -60, left: "50%", transform: "translateX(-50%)" }} />
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stactoro-logo-wide.jpg" alt="Stactoro" style={{ height: 72, width: "auto", objectFit: "contain", marginBottom: 28 }} />
              <h2 style={{ fontSize: "clamp(26px, 3.8vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#EEEEF4", marginBottom: 14, lineHeight: 1.06 }}>
                Start building smarter today.
              </h2>
              <p style={{ color: "#3E3E54", fontSize: 16, marginBottom: 34, maxWidth: 460, margin: "0 auto 34px" }}>
                Join businesses already saving $400+ per month. Get started free — no credit card needed.
              </p>
              <Link href="/signup" className="btn-primary" style={{ fontSize: 15, padding: "13px 32px" }}>
                Start your free 14-day trial
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── FOOTER ─────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stactoro-icon.jpg" alt="Stactoro" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 4 }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#E8E8EE", letterSpacing: "-0.02em" }}>Stactoro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <a href="#features" style={{ color: "#252535", fontSize: 13, textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ color: "#252535", fontSize: 13, textDecoration: "none" }}>Pricing</a>
            <Link href="/login" style={{ color: "#252535", fontSize: 13, textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" style={{ color: "#252535", fontSize: 13, textDecoration: "none" }}>Sign up</Link>
          </div>
          <p style={{ fontSize: 11.5, color: "#1A1A26" }}>© 2026 Stactoro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
