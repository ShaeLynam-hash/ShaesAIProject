import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface Props { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invite</h1>
          <p className="text-slate-500">This invite link has expired or already been used.</p>
          <a href="/onboarding" className="mt-4 inline-block text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  // Accept invite
  await prisma.workspaceMember.create({
    data: {
      workspaceId: invite.workspaceId,
      userId: session.user.id,
      role: invite.role,
    },
  }).catch(() => null); // already member = ignore

  await prisma.workspaceInvite.update({
    where: { token },
    data: { acceptedAt: new Date() },
  });

  redirect(`/app/${invite.workspace.slug}/dashboard`);
}
