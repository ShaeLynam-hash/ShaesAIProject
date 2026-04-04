"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 49,
    desc: "For small businesses getting started",
    features: [
      "Up to 3 team members",
      "All core modules",
      "1,000 email sends/mo",
      "Basic analytics",
      "Email support",
    ],
    featured: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 99,
    desc: "For growing teams that need more",
    features: [
      "Up to 10 team members",
      "All modules + AI assistant",
      "10,000 email sends/mo",
      "Advanced analytics + reports",
      "Priority support",
      "Custom branding",
    ],
    featured: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 249,
    desc: "For large organizations at scale",
    features: [
      "Unlimited team members",
      "Everything in Pro",
      "Unlimited emails",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label option",
    ],
    featured: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, workspaceSlug: "" }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/register";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
    setLoading(null);
  };

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
        * { box-sizing: border-box; }
        .nav-glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(8, 8, 10, 0.8);
          border-bottom: 1px solid var(--obs-border);
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
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) {
          background: #5558e8;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
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
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        .btn-ghost:hover:not(:disabled) {
          border-color: var(--obs-accent-2);
          color: var(--obs-accent-2);
        }
        .btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-sm-ghost {
          background: transparent;
          color: var(--obs-muted);
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .btn-sm-ghost:hover { color: var(--obs-text); background: rgba(255,255,255,0.05); }
        .btn-sm-primary {
          background: var(--obs-accent);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
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
        .nav-link {
          color: var(--obs-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
          padding: 8px 12px;
        }
        .nav-link:hover { color: var(--obs-text); }
      `}</style>

      {/* Navbar */}
      <header className="nav-glass" style={{ position: "sticky", top: 0, zIndex: 100 }}>
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
          <Link href="/" style={{ textDecoration: "none", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: "var(--obs-accent)" }}>✦</span>
            <span style={{ color: "var(--obs-text)", marginLeft: 6 }}>Luminary</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/#features" className="nav-link">Features</Link>
            <Link href="/pricing" className="nav-link" style={{ color: "var(--obs-text)" }}>Pricing</Link>
            <Link href="/#about" className="nav-link">About</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" className="btn-sm-ghost">Sign in</Link>
            <Link href="/register" className="btn-sm-primary">Start free trial</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--obs-accent-2)",
            marginBottom: 16,
          }}
        >
          Pricing
        </p>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "var(--obs-text)",
            marginBottom: 16,
          }}
        >
          Simple, honest pricing
        </h1>
        <p style={{ color: "var(--obs-muted)", fontSize: 18, maxWidth: 500, margin: "0 auto" }}>
          14-day free trial on all plans. No credit card required to start.
        </p>
      </section>

      {/* Plans grid */}
      <section style={{ padding: "0 24px 100px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {plans.map((plan) => (
            <div key={plan.key} className={`pricing-card${plan.featured ? " featured" : ""}`} style={plan.featured ? { marginTop: -16 } : {}}>
              {plan.featured && <div className="popular-badge">Most Popular</div>}

              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--obs-text)", marginBottom: 6 }}>
                  {plan.name}
                </h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, color: "var(--obs-text)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    ${plan.price}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--obs-muted)", fontWeight: 500 }}>/mo</span>
                </div>
                <p style={{ color: "var(--obs-muted)", fontSize: 13, marginTop: 6 }}>{plan.desc}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} className="check-item">
                    <span style={{ color: "var(--obs-success)", flexShrink: 0, marginTop: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="rgba(34,197,94,0.15)"/>
                        <path d="M4.5 8l2.5 2.5 4-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={plan.featured ? "btn-primary" : "btn-ghost"}
                disabled={loading === plan.key}
                onClick={() => handleCheckout(plan.key)}
              >
                {loading === plan.key ? "Loading…" : "Start free trial"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--obs-border)", padding: "40px 24px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            <span style={{ color: "var(--obs-accent)" }}>✦</span>
            <span style={{ color: "var(--obs-text)", marginLeft: 6 }}>Luminary</span>
          </div>
          <p style={{ color: "var(--obs-muted)", fontSize: 13 }}>
            &copy; 2026 Luminary. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
