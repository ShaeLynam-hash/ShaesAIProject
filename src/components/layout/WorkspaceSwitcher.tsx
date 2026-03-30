"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Plus, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [current, setCurrent] = useState<WorkspaceItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    // TODO: fetch from API
    const mock: WorkspaceItem[] = [{ id: "1", name: workspaceSlug, slug: workspaceSlug }];
    setWorkspaces(mock);
    setCurrent(mock[0]);
  }, [workspaceSlug]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left bg-transparent border-0">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-white" />
        </div>
        <span className="flex-1 text-sm font-semibold text-white truncate capitalize">
          {current?.name ?? workspaceSlug}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="start">
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            className="hover:bg-slate-700 cursor-pointer"
            onClick={() => router.push(`/app/${ws.slug}/dashboard`)}
          >
            <Building2 size={14} className="mr-2" />
            <span className="capitalize">{ws.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="hover:bg-slate-700 cursor-pointer text-blue-400"
          onClick={() => router.push("/onboarding")}
        >
          <Plus size={14} className="mr-2" />
          New Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
