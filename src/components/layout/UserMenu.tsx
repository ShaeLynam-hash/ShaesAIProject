"use client";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu({ workspaceSlug }: { workspaceSlug: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
        <Avatar className="w-9 h-9">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/app/${workspaceSlug}/settings/profile`)}>
          <User size={14} className="mr-2" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <Building2 size={14} className="mr-2" /> Switch Workspace
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={14} className="mr-2" /> Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
