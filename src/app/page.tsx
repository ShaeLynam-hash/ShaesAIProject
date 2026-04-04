"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  return <LandingPage />;
}

function LandingPage() {
  return (
    <div style={{
      background: "#070709",
      color: "#EDEDF0",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #070709; }
        ::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 3px; }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }

        .nav-blur {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          background: rgba(7,7,9,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .glow-amber {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .ticker-wrap {
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-inner {
          display: inline-flex;
          animation: ticker 28s linear infinite;
          gap: 0;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .bento-card {
          background: #0F0F12;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          border-color: rgba(251,191,36,0.2);
          box-shadow: 0 0 40px rgba(251,191,36,0.04);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.15);
          color: #FCD34D;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: #0a0800;
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(245,158,11,0.35);
          background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #EDEDF0;
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          transition: all 0.2s ease;
        }
        .btn-outline:hover {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04);
        }

        .nav-link {
          color: #6B6B76;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
          padding: 8px 12px;
          border-radius: 6px;
        }
        .nav-link:hover { color: #EDEDF0; background: rgba(255,255,255,0.04); }

        .pricing-card {
          background: #0F0F12;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.25s ease;
          position: relative;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .pricing-card.gold {
          background: linear-gradient(160deg, rgba(245,158,11,0.08) 0%, #0F0F12 60%);
          border-color: rgba(245,158,11,0.25);
          box-shadow: 0 0 0 1px rgba(245,158,11,0.1), 0 20px 60px rgba(245,158,11,0.08);
        }

        .check { color: #F59E0B; font-size: 14px; }
        .feature-li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #8B8B96;
          padding: 5px 0;
        }

        .quote-card {
          background: #0F0F12;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.2s ease;
        }
        .quote-card:hover {
          border-color: rgba(245,158,11,0.15);
          transform: translateY(-2px);
        }

        .module-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #8B8B96;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .hide-mob { display: none !important; }
          .mob-col { flex-direction: column !important; }
          .mob-full { width: 100% !important; grid-column: span 1 !important; }
          .mob-center { text-align: center !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header className="nav-blur" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#0a0800", fontWeight: 900, fontSize: 14 }}>L</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#EDEDF0", letterSpacing: "-0.02em" }}>Luminary</span>
          </Link>

          <div className="hide-mob" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" style={{ color: "#8B8B96", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "7px 14px" }}>Sign in</Link>
            <Link href="/signup" className="btn-gold" style={{ padding: "7px 18px", fontSize: 14 }}>Start free</Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "100px 24px 80px", overflow: "hidden" }}>
        {/* Ambient glows */}
        <div className="glow-amber" style={{ width: 600, height: 400, background: "rgba(245,158,11,0.06)", top: -100, left: "20%", transform: "translateX(-50%)" }} />
        <div className="glow-amber" style={{ width: 400, height: 300, background: "rgba(99,102,241,0.05)", top: 0, right: "10%" }} />

        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <div style={{ marginBottom: 32 }}>
            <span className="pill">✦ All-in-one business platform</span>
          </div>

          {/* Headline — editorial split style */}
          <div style={{ maxWidth: 780, marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: "#EDEDF0" }}>
              The only platform{" "}
              <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "#F59E0B" }}>your business</span>
              <br />will ever need.
            </h1>
          </div>

          {/* Subtitle + CTA row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 60, flexWrap: "wrap", marginBottom: 64 }}>
            <p style={{ fontSize: 18, color: "#6B6B76", lineHeight: 1.65, maxWidth: 460, flex: "1 1 300px" }}>
              Replace QuickBooks, Calendly, Mailchimp, HubSpot, and Twilio.
              One login. One subscription. Everything just works.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "0 0 auto" }}>
              <Link href="/signup" className="btn-gold">
                Start free — 14 days
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#features" className="btn-outline" style={{ justifyContent: "center" }}>
                See all features
              </a>
              <p style={{ fontSize: 12, color: "#4B4B56", textAlign: "center" }}>No credit card required</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 40, flexWrap: "wrap" }}>
            {[
              { n: "16+", l: "Built-in modules" },
              { n: "$400+", l: "Avg. monthly savings" },
              { n: "14 day", l: "Free trial" },
              { n: "1", l: "Platform to rule them all" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 160px", padding: "0 32px 0 0", marginBottom: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "#4B4B56", marginTop: 5, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", background: "#0A0A0D" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {["QuickBooks", "Calendly", "Mailchimp", "HubSpot", "Twilio", "Stripe Billing", "Typeform", "Intercom", "Gusto HR", "Dropbox", "Monday.com", "Zapier"].map((t) => (
                  <span key={t} style={{ padding: "0 28px", color: "#3A3A42", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    {t} <span style={{ color: "#F59E0B", marginLeft: 8 }}>✕</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BENTO FEATURES ── */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>Features</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", lineHeight: 1.1, marginTop: 16 }}>
              Built for how real businesses work
            </h2>
          </div>

          {/* Bento grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto", gap: 12 }}>

            {/* Large card — Payments */}
            <div className="bento-card" style={{ gridColumn: "span 2", padding: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#EDEDF0" }}>Payments & Invoicing</h3>
              </div>
              <p style={{ color: "#5B5B66", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Create and send professional invoices in seconds. Track expenses by category, view profit & loss reports, and manage recurring subscriptions — all without opening QuickBooks.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Invoices", "Expenses", "P&L Reports", "Subscriptions", "Customers"].map(t => (
                  <span key={t} className="module-tag">{t}</span>
                ))}
              </div>
            </div>

            {/* Booking */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>📅</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>Booking & Scheduling</h3>
              <p style={{ color: "#5B5B66", fontSize: 13, lineHeight: 1.65 }}>
                Shareable booking pages. Clients self-schedule 24/7. No more back-and-forth emails.
              </p>
            </div>

            {/* CRM */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>👥</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>CRM & Sales Pipeline</h3>
              <p style={{ color: "#5B5B66", fontSize: 13, lineHeight: 1.65 }}>
                Track contacts, deals, and your entire pipeline from prospect to close.
              </p>
            </div>

            {/* Email & SMS */}
            <div className="bento-card" style={{ gridColumn: "span 2", padding: 36, display: "flex", alignItems: "center", gap: 40 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>📧</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>Email & SMS Campaigns</h3>
                <p style={{ color: "#5B5B66", fontSize: 14, lineHeight: 1.7 }}>
                  Design and send email campaigns. Schedule SMS blasts. Build automations that run while you sleep.
                </p>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 8, opacity: 0.7 }} className="hide-mob">
                {["Welcome series", "Abandoned cart", "Re-engagement", "Weekly digest"].map(t => (
                  <div key={t} style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#F59E0B", fontWeight: 500 }}>
                    ✓ {t}
                  </div>
                ))}
              </div>
            </div>

            {/* AI */}
            <div className="bento-card" style={{ padding: 32, background: "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, #0F0F12 100%)", borderColor: "rgba(99,102,241,0.12)" }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>AI Assistant</h3>
              <p style={{ color: "#5B5B66", fontSize: 13, lineHeight: 1.65 }}>
                Write emails, analyze sales data, summarize reports, and automate decisions with built-in AI.
              </p>
            </div>

            {/* Analytics */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>Analytics & Reports</h3>
              <p style={{ color: "#5B5B66", fontSize: 13, lineHeight: 1.65 }}>
                Real-time dashboards, revenue trends, and custom reports for every module.
              </p>
            </div>

            {/* More modules */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#EDEDF0", marginBottom: 10 }}>Automations</h3>
              <p style={{ color: "#5B5B66", fontSize: 13, lineHeight: 1.65 }}>
                Trigger actions across modules automatically. Like Zapier, but built in.
              </p>
            </div>

            {/* Support + HR + more */}
            <div className="bento-card" style={{ gridColumn: "span 3", padding: 28 }}>
              <p style={{ fontSize: 12, color: "#4B4B56", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>And even more built in</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Support Tickets", "HR & Employees", "Document Editor", "Calendar", "File Storage", "Webhooks", "Forms Builder", "Database Browser", "Client Portal", "Team Management", "API Keys", "2FA Security"].map(t => (
                  <span key={t} className="module-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "100px 24px", background: "#0A0A0D" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>Pricing</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", marginTop: 16, lineHeight: 1.1 }}>
              One price. Everything included.
            </h2>
            <p style={{ color: "#5B5B66", marginTop: 14, fontSize: 16 }}>
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
            {/* Starter */}
            <div className="pricing-card">
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5B5B66", marginBottom: 10 }}>Starter</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", lineHeight: 1 }}>$49</span>
                  <span style={{ color: "#4B4B56", fontSize: 15 }}>/mo</span>
                </div>
                <p style={{ color: "#4B4B56", fontSize: 13 }}>For small businesses getting started</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
                {["Up to 3 team members", "All core modules", "1,000 email sends/mo", "Basic analytics", "Email support"].map(f => (
                  <div key={f} className="feature-li"><span className="check">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>

            {/* Pro — featured */}
            <div className="pricing-card gold" style={{ marginTop: -12 }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0a0800", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F59E0B", marginBottom: 10 }}>Pro</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", lineHeight: 1 }}>$99</span>
                  <span style={{ color: "#4B4B56", fontSize: 15 }}>/mo</span>
                </div>
                <p style={{ color: "#4B4B56", fontSize: 13 }}>For growing teams that need more</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
                {["Up to 10 team members", "All modules + AI assistant", "10,000 email sends/mo", "Advanced analytics + reports", "Priority support", "Custom branding"].map(f => (
                  <div key={f} className="feature-li"><span className="check">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-gold" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card">
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5B5B66", marginBottom: 10 }}>Enterprise</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", lineHeight: 1 }}>$249</span>
                  <span style={{ color: "#4B4B56", fontSize: 15 }}>/mo</span>
                </div>
                <p style={{ color: "#4B4B56", fontSize: 13 }}>For large organizations at scale</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
                {["Unlimited team members", "Everything in Pro", "Unlimited emails", "Dedicated account manager", "SLA guarantee", "White-label option"].map(f => (
                  <div key={f} className="feature-li"><span className="check">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/signup" className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>Reviews</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", marginTop: 16, lineHeight: 1.1 }}>
              Businesses love Luminary
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              { q: "Luminary replaced 6 different subscriptions for us. We save $400/month and everything is finally in one place.", name: "Sarah M.", role: "Boutique Owner", c: "#F59E0B" },
              { q: "The booking system alone is worth it. My clients love how easy it is to schedule. I never get double-booked anymore.", name: "James K.", role: "Personal Trainer", c: "#818CF8" },
              { q: "Finally, an all-in-one that actually works. Setup took 10 minutes and I was sending invoices the same day.", name: "Priya L.", role: "Consultant", c: "#22C55E" },
            ].map((t, i) => (
              <div key={i} className="quote-card">
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#F59E0B", fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ color: "#EDEDF0", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>"{t.q}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#0a0800" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#EDEDF0" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#4B4B56" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 24, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "rgba(245,158,11,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#EDEDF0", marginBottom: 16, lineHeight: 1.1, position: "relative" }}>
            Ready to run your business{" "}
            <span className="serif" style={{ fontStyle: "italic", color: "#F59E0B" }}>smarter?</span>
          </h2>
          <p style={{ color: "#5B5B66", fontSize: 17, marginBottom: 36, position: "relative" }}>
            Join businesses already saving hundreds per month. Start your 14-day free trial today.
          </p>
          <Link href="/signup" className="btn-gold" style={{ fontSize: 16, padding: "15px 32px", position: "relative" }}>
            Get started free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#0a0800", fontWeight: 900, fontSize: 12 }}>L</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#EDEDF0" }}>Luminary</span>
            <span style={{ color: "#2A2A32", margin: "0 8px" }}>·</span>
            <span style={{ fontSize: 13, color: "#3A3A42" }}>The last platform you&apos;ll ever need.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <a href="#features" style={{ color: "#3A3A42", fontSize: 13, textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ color: "#3A3A42", fontSize: 13, textDecoration: "none" }}>Pricing</a>
            <Link href="/login" style={{ color: "#3A3A42", fontSize: 13, textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" style={{ color: "#3A3A42", fontSize: 13, textDecoration: "none" }}>Sign up</Link>
          </div>
          <p style={{ fontSize: 12, color: "#2A2A32" }}>© 2026 Luminary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
