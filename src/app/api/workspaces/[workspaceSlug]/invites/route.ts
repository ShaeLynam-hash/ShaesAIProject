import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceMember } from "@/lib/workspace";
import { inviteMemberSchema } from "@/lib/validators/invite";
import { resend, FROM_EMAIL, APP_NAME, APP_URL } from "@/lib/resend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await assertWorkspaceMember(workspace.id, session.user.id, "ADMIN");

  const body = await req.json();
  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { email, role } = parsed.data;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.workspaceInvite.upsert({
    where: { workspaceId_email: { workspaceId: workspace.id, email } },
    update: { role, expiresAt, acceptedAt: null },
    create: { workspaceId: workspace.id, email, role, expiresAt },
  });

  const inviter = await prisma.user.findUnique({ where: { id: session.user.id } });

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${inviter?.name ?? "Someone"} invited you to join ${workspace.name} on ${APP_NAME}`,
    html: inviteEmailHtml(inviter?.name ?? "A team member", workspace.name, invite.token),
  });

  return NextResponse.json({ invite }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await params;
  const { inviteId } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await assertWorkspaceMember(workspace.id, session.user.id, "ADMIN");
  await prisma.workspaceInvite.delete({ where: { id: inviteId } });

  return NextResponse.json({ success: true });
}

function inviteEmailHtml(inviterName: string, workspaceName: string, token: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#0F172A;">You've been invited!</h1>
      <p style="color:#475569;"><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on ${APP_NAME}.</p>
      <a href="${APP_URL}/invite/${token}" style="display:inline-block;background:#3B82F6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">Accept Invite →</a>
      <p style="color:#94A3B8;font-size:14px;">This invite expires in 7 days.</p>
      <p style="color:#CBD5E1;font-size:12px;">© 2025 ${APP_NAME}. All rights reserved.</p>
    </div>
  `;
}
