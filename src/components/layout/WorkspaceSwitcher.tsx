"use client";
import { Building2 } from "lucide-react";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const name = workspaceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--obs-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Building2 size={15} color="#0a0800" />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--obs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
        {name}
      </span>
    </div>
  );
}
