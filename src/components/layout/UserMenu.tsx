"use client";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu({ workspaceSlug }: { workspaceSlug: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--obs-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0a0800" }}>
          {initials}
        </div>
        <ChevronDown size={13} style={{ color: "var(--obs-muted)" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "var(--obs-surface)", border: "1px solid var(--obs-border)", borderRadius: 12, padding: 6, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--obs-border)", marginBottom: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--obs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: "var(--obs-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
          {[
            { label: "Profile", icon: User, action: () => { router.push(`/app/${workspaceSlug}/settings`); setOpen(false); } },
          ].map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={action}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "var(--obs-text)", fontSize: 13, textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--obs-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <Icon size={14} /> {label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid var(--obs-border)", marginTop: 4, paddingTop: 4 }}>
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
