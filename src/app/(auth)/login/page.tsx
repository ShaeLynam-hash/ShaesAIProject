"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { signInSchema, type SignInInput } from "@/lib/validators/auth";

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
} as const;

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#6B6B76",
  marginBottom: 6,
  letterSpacing: "0.02em",
} as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/onboarding";
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (result?.error) toast.error("Invalid email or password");
    else router.push(callbackUrl);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#EDEDF0", letterSpacing: "-0.02em", marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: "#5B5B66" }}>Sign in to your Luminary account</p>
      </div>

      {/* Google SSO */}
      <button
        onClick={() => signIn("google", { callbackUrl })}
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
        <span style={{ fontSize: 12, color: "#3A3A42", fontWeight: 500 }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" {...register("email")} placeholder="you@company.com" style={inputStyle} />
          {errors.email && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.email.message}</p>}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#F59E0B", textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} {...register("password")} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5B5B66", display: "flex" }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#0a0800", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, fontFamily: "inherit", marginTop: 4 }}>
          {isSubmitting ? "Signing in…" : "Sign In →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "#4B4B56", marginTop: 20 }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#F59E0B", fontWeight: 600, textDecoration: "none" }}>Start free trial</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
