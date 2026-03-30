"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MemberWithUser } from "@/types";

const roleBadgeColor: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MEMBER: "bg-slate-100 text-slate-700",
  VIEWER: "bg-green-100 text-green-700",
};

interface TeamTableProps {
  members: MemberWithUser[];
  workspaceSlug: string;
  currentUserId: string;
}

export function TeamTable({ members: initial, workspaceSlug, currentUserId }: TeamTableProps) {
  const [members, setMembers] = useState(initial);

  const handleRemove = async (userId: string) => {
    const res = await fetch(`/api/workspaces/${workspaceSlug}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.success("Member removed");
    } else {
      toast.error("Failed to remove member");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const initials = member.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";
          return (
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.user.name ?? "Unknown"}</p>
                  <p className="text-xs text-slate-500">{member.user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadgeColor[member.role]}`}>
                  {member.role}
                </span>
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {new Date(member.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {member.userId !== currentUserId && member.role !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemove(member.userId)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
