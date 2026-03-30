"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setDone(true);
      toast.success("Password updated!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--obs-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl mb-6 mx-auto"
          style={{ background: "var(--obs-accent)" }}>
          <Lock size={22} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--obs-text)" }}>
          {done ? "Password updated!" : "Set new password"}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--obs-muted)" }}>
          {done ? "Redirecting you to login…" : "Choose a strong password for your account"}
        </p>

        {!done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--obs-muted)" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:ring-2"
                  style={{
                    background: "var(--obs-elevated)",
                    borderColor: "var(--obs-border)",
                    color: "var(--obs-text)",
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPw
                    ? <EyeOff size={14} style={{ color: "var(--obs-muted)" }} />
                    : <Eye size={14} style={{ color: "var(--obs-muted)" }} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--obs-muted)" }}>
                Confirm Password
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--obs-elevated)",
                  borderColor: "var(--obs-border)",
                  color: "var(--obs-text)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "var(--obs-accent)" }}>
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
