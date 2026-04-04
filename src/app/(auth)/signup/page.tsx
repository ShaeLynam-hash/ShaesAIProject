"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

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

export default function SignupPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters"); return; }
    if (!form.email.includes("@")) { setError("Enter a valid email address"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);

    // Create account
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    if (res.status === 409) { setError("An account with this email already exists"); setLoading(false); return; }
    if (!res.ok) { setError("Something went wrong. Please try again."); setLoading(false); return; }

    // Sign in
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created! Please sign in.");
      router.push("/login");
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#EDEDF0", letterSpacing: "-0.02em", marginBottom: 6 }}>Start your free trial</h1>
        <p style={{ fontSize: 14, color: "#5B5B66" }}>14 days free. No credit card required.</p>
      </div>

      {/* Google SSO */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#EDEDF0", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
          <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
          <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: 12, color: "#3A3A42", fontWeight: 500 }}>or sign up with email</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Smith"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Work Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.com"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5B5B66", display: "flex", padding: 0 }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "13px", background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}
        >
          {loading ? "Creating account…" : "Create Free Account →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "#4B4B56", marginTop: 20 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#F59E0B", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}
