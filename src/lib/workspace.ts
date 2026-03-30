import { prisma } from "@/lib/prisma";
import { MemberRole } from "@prisma/client";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: { include: { user: true } },
    },
  });
}

export async function getUserWorkspaces(userId: string) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });
}

export async function assertWorkspaceMember(
  workspaceId: string,
  userId: string,
  minRole?: MemberRole
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new Error("Not a workspace member");

  if (minRole) {
    const hierarchy: MemberRole[] = ["VIEWER", "MEMBER", "ADMIN", "OWNER"];
    if (hierarchy.indexOf(member.role) < hierarchy.indexOf(minRole)) {
      throw new Error("Insufficient permissions");
    }
  }
  return member;
}

export async function logAudit(
  workspaceId: string,
  action: string,
  userId?: string,
  metadata?: Record<string, string | number | boolean | null>
) {
  return prisma.auditLog.create({
    data: { workspaceId, action, userId, metadata: metadata ?? undefined },
  });
}
