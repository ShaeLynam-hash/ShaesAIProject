import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceMember } from "@/lib/workspace";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await assertWorkspaceMember(workspace.id, session.user.id);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
  });

  return NextResponse.json({ members });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await params;
  const { userId } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await assertWorkspaceMember(workspace.id, session.user.id, "ADMIN");

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });

  return NextResponse.json({ success: true });
}
