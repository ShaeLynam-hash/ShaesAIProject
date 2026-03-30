import type { User, Workspace, WorkspaceMember, MemberRole, Plan, SubscriptionStatus } from "@prisma/client";

export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & { user: User })[];
};

export type MemberWithUser = WorkspaceMember & { user: User };

export { MemberRole, Plan, SubscriptionStatus };
