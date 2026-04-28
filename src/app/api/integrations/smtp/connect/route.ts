import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, host, port, username, password, fromEmail, fromName, secure } = await req.json();
  if (!workspaceSlug || !host || !port || !username || !password || !fromEmail) {
    return NextResponse.json({ error: "Missing required SMTP fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId: session.user.id } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workspaceIntegration.upsert({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "smtp" } },
    create: {
      workspaceId: workspace.id, provider: "smtp",
      apiKey: password,
      config: { host, port: Number(port), username, fromEmail, fromName, secure: !!secure },
      status: "active",
    },
    update: {
      apiKey: password,
      config: { host, port: Number(port), username, fromEmail, fromName, secure: !!secure },
      status: "active", errorMsg: null,
    },
  });

  // Update workspace email settings
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { fromEmail, fromName: fromName ?? undefined },
  });

  return NextResponse.json({ success: true });
}
