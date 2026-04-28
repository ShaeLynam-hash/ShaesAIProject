import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ provider: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await params;
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId: session.user.id } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workspaceIntegration.deleteMany({
    where: { workspaceId: workspace.id, provider },
  });

  return NextResponse.json({ success: true });
}
