"use client";
import { Search, Bell } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  title: string;
  workspaceSlug: string;
}

export function Topbar({ title, workspaceSlug }: TopbarProps) {
  return (
    <header className="h-14 flex items-center px-5 gap-4 shrink-0 border-b"
      style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
      <h1 className="text-sm font-semibold flex-1" style={{ color: "var(--obs-text)" }}>
        {title}
      </h1>

      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-56 border"
        style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
        <Search size={13} style={{ color: "var(--obs-muted)" }} className="shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          className="bg-transparent text-xs outline-none w-full placeholder:opacity-50"
          style={{ color: "var(--obs-text)" }}
        />
        <kbd className="text-[10px] px-1 rounded border"
          style={{ color: "var(--obs-muted)", borderColor: "var(--obs-border)" }}>⌘K</kbd>
      </div>

      <button className="relative p-1.5 rounded-lg transition-colors hover:bg-white/5">
        <Bell size={16} style={{ color: "var(--obs-muted)" }} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--obs-accent)" }} />
      </button>

      <UserMenu workspaceSlug={workspaceSlug} />
    </header>
  );
}
