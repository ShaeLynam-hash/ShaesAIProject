"use client";
import { Building2, ChevronDown } from "lucide-react";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const name = workspaceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "linear-gradient(135deg, #F59E0B, #D97706)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ color: "#0a0800", fontWeight: 900, fontSize: 14 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#EDEDF0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>Workspace</p>
      </div>
      <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
    </div>
  );
}
