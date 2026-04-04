"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signUpSchema, type SignUpInput } from "@/lib/validators/auth";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 10,
  color: "#EDEDF0",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
} as const;

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#6B6B76",
  marginBottom: 6,
  letterSpacing: "0.02em",
} as const;

export default function SignupPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });

    if (res.status === 409) { toast.error("An account with this email already exists"); return; }
    if (!res.ok) { toast.error("Something went wrong. Please try again."); return; }

    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (result?.error) { toast.error("Account created but sign-in failed. Please log in."); router.push("/login"); }
    else router.push("/onboarding");
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#EDEDF0", letterSpacing: "-0.02em", marginBottom: 6 }}>Start your free trial</h1>
        <p style={{ fontSize: 14, color: "#5B5B66" }}>14 days free. No credit card required.</p>
      </div>

      {/* Google SSO */}
      <button
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

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input {...register("name")} placeholder="Jane Smith" style={inputStyle} />
          {errors.name && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.name.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Work Email</label>
          <input type="email" {...register("email")} placeholder="jane@company.com" style={inputStyle} />
          {errors.email && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.email.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} {...register("password")} placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5B5B66", display: "flex" }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.password.message}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <input type="checkbox" id="terms" {...register("terms")} style={{ marginTop: 2, accentColor: "#F59E0B" }} />
          <label htmlFor="terms" style={{ fontSize: 13, color: "#5B5B66", lineHeight: 1.5 }}>
            I agree to the{" "}
            <Link href="#" style={{ color: "#F59E0B", textDecoration: "none" }}>Terms</Link>
            {" "}and{" "}
            <Link href="#" style={{ color: "#F59E0B", textDecoration: "none" }}>Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && <p style={{ fontSize: 12, color: "#ef4444", marginTop: -8 }}>{errors.terms.message}</p>}

        <button type="submit" disabled={isSubmitting}
          style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, fontFamily: "inherit", marginTop: 4 }}>
          {isSubmitting ? "Creating account…" : "Create Free Account →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "#4B4B56", marginTop: 20 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#F59E0B", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}
