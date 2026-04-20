import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, to, subject, html, text, contactName, conversationId } = await req.json();
  if (!workspaceSlug || !to || !subject || (!html && !text)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const apiKey = workspace.resendApiKey ?? process.env.RESEND_API_KEY;
  const fromEmail = workspace.fromEmail ?? process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const fromName = workspace.fromName ?? workspace.name;

  if (!apiKey) {
    return NextResponse.json({ error: "Resend not configured. Add API key in Settings → Communications." }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  let emailId: string | undefined;
  let status = "sent";

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html: html ?? `<p>${text}</p>`,
      text: text ?? undefined,
    });
    emailId = result.data?.id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Email send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Find or create conversation
  let convo = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId } })
    : await prisma.conversation.findFirst({ where: { workspaceId: workspace.id, channel: "email", contactEmail: to } });

  if (!convo) {
    convo = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        channel: "email",
        contactEmail: to,
        contactName: contactName ?? to,
        subject,
        lastMessageAt: new Date(),
      },
    });
  } else {
    await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
  }

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId: convo.id,
      direction: "outbound",
      body: text ?? subject,
      status,
      externalId: emailId,
    },
  });

  return NextResponse.json({ message, conversation: convo }, { status: 201 });
}
