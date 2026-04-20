import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      name: true,
      fromEmail: true,
      fromName: true,
      twilioFromNumber: true,
      // Don't return secret keys in full — just whether they're set
      twilioAccountSid: true,
      twilioAuthToken: true,
      resendApiKey: true,
      missedCallTextBack: true,
      missedCallMessage: true,
      aiAutoReply: true,
      aiAutoReplyPrompt: true,
    },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mask secrets — only return whether they're configured
  return NextResponse.json({
    settings: {
      fromEmail: workspace.fromEmail,
      fromName: workspace.fromName,
      twilioFromNumber: workspace.twilioFromNumber,
      twilioConfigured: !!(workspace.twilioAccountSid && workspace.twilioAuthToken),
      resendConfigured: !!workspace.resendApiKey,
      missedCallTextBack: workspace.missedCallTextBack,
      missedCallMessage: workspace.missedCallMessage,
      aiAutoReply: workspace.aiAutoReply,
      aiAutoReplyPrompt: workspace.aiAutoReplyPrompt,
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, twilioAccountSid, twilioAuthToken, twilioFromNumber, resendApiKey, fromEmail, fromName, missedCallTextBack, missedCallMessage, aiAutoReply, aiAutoReplyPrompt } = await req.json();
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, string | boolean | null> = {};
  if (twilioAccountSid !== undefined) data.twilioAccountSid = twilioAccountSid || null;
  if (twilioAuthToken !== undefined) data.twilioAuthToken = twilioAuthToken || null;
  if (twilioFromNumber !== undefined) data.twilioFromNumber = twilioFromNumber || null;
  if (resendApiKey !== undefined) data.resendApiKey = resendApiKey || null;
  if (fromEmail !== undefined) data.fromEmail = fromEmail || null;
  if (fromName !== undefined) data.fromName = fromName || null;
  if (missedCallTextBack !== undefined) data.missedCallTextBack = !!missedCallTextBack;
  if (missedCallMessage !== undefined) data.missedCallMessage = missedCallMessage || null;
  if (aiAutoReply !== undefined) data.aiAutoReply = !!aiAutoReply;
  if (aiAutoReplyPrompt !== undefined) data.aiAutoReplyPrompt = aiAutoReplyPrompt || null;

  await prisma.workspace.update({ where: { id: workspace.id }, data });

  return NextResponse.json({ ok: true });
}
