import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteModal } from "@/components/settings/InviteModal";

interface Props { params: Promise<{ workspaceSlug: string }> }

const roleBadge: Record<string, { label: string; color: string }> = {
  OWNER:  { label: "Owner",  color: "#6366F1" },
  ADMIN:  { label: "Admin",  color: "#818CF8" },
  MEMBER: { label: "Member", color: "#6B6B76" },
  VIEWER: { label: "Viewer", color: "#6B6B76" },
};

export default async function AuthUsersPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { members: { include: { user: true }, orderBy: { joinedAt: "asc" } } },
  });
  if (!workspace) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Users</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <InviteModal workspaceSlug={workspaceSlug} />
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>User</span><span>Role</span><span>Joined</span><span>Status</span><span />
        </div>
        {workspace.members.map(({ user, role, joinedAt }) => {
          const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "U";
          const badge = roleBadge[role] ?? roleBadge.MEMBER;
          return (
            <div key={user.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
              style={{ borderColor: "var(--obs-border)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs font-bold"
                    style={{ background: "var(--obs-elevated)", color: "var(--obs-accent)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{user.name ?? "Unknown"}</p>
                  <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{user.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
                style={{ background: `${badge.color}18`, color: badge.color }}>
                {badge.label}
              </span>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
                {new Date(joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <div className="flex items-center gap-1.5">
                {user.isSuspended ? (
                  <span className="text-xs" style={{ color: "var(--obs-danger)" }}>Suspended</span>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--obs-success)" }} />
                    <span className="text-xs" style={{ color: "var(--obs-success)" }}>Active</span>
                  </>
                )}
              </div>
              <div className="flex justify-center">
                <MoreHorizontal size={14} style={{ color: "var(--obs-muted)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
