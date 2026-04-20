"use client";
import { Search, Bell } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  workspaceSlug: string;
  workspaceName: string;
}

export function Topbar({ workspaceSlug, workspaceName }: TopbarProps) {
  return (
    <header style={{
      height: 56,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 16,
      flexShrink: 0,
      background: "#0D0D10",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Workspace name */}
      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", flexShrink: 0 }}>
        {workspaceName}
      </p>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      {/* Search */}
      <div style={{
        flex: 1,
        maxWidth: 380,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        height: 34,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
      }}>
        <Search size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search anything…"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#EDEDF0",
            width: "100%",
          }}
        />
        <kbd style={{
          fontSize: 10,
          padding: "2px 6px",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.25)",
          fontFamily: "inherit",
          flexShrink: 0,
        }}>⌘K</kbd>
      </div>

      <div style={{ flex: 1 }} />

      {/* Notifications */}
      <button style={{
        position: "relative",
        width: 34,
        height: 34,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
      }}>
        <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
        <span style={{
          position: "absolute",
          top: 7,
          right: 7,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#F59E0B",
          border: "1.5px solid #0D0D10",
        }} />
      </button>

      <UserMenu workspaceSlug={workspaceSlug} />
    </header>
  );
}
