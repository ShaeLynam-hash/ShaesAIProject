"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070709",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: 24,
    }}>
      <div style={{
        maxWidth: 520,
        width: "100%",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#EDEDF0", marginBottom: 12 }}>
          Dashboard failed to load
        </h2>
        <p style={{
          fontSize: 12,
          color: "#6B6B76",
          background: "rgba(0,0,0,0.3)",
          padding: "10px 14px",
          borderRadius: 8,
          textAlign: "left",
          wordBreak: "break-all",
          marginBottom: 24,
        }}>
          {error.message || "Unknown error"}
          {error.digest && <><br /><span style={{ opacity: 0.5 }}>Digest: {error.digest}</span></>}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{ padding: "10px 20px", background: "#F59E0B", color: "#000", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            Try again
          </button>
          <a
            href="/onboarding"
            style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", color: "#EDEDF0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            Back to onboarding
          </a>
        </div>
      </div>
    </div>
  );
}
