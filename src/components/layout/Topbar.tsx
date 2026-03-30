"use client";
import { Search, Bell } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  title: string;
  workspaceSlug: string;
}

export function Topbar({ title, workspaceSlug }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-lg font-semibold text-slate-900 flex-1">{title}</h1>

      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
        />
      </div>

      <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Bell size={20} className="text-slate-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
      </button>

      <UserMenu workspaceSlug={workspaceSlug} />
    </header>
  );
}
