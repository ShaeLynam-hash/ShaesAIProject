import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import twilio from "twilio";

// POST /api/reviews — send review request to a contact (or batch)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, contactIds, channel, reviewLink, customMessage } = await req.json();
  if (!workspaceSlug || !contactIds?.length || !channel) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true, name: true, fromEmail: true, fromName: true, resendApiKey: true,
      twilioSubAccountSid: true, twilioSubAccountToken: true, twilioPhoneNumber: true,
    },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds }, workspaceId: workspace.id },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });

  const link = reviewLink || "https://g.page/r/review";
  const brandName = workspace.fromName ?? workspace.name;

  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    const firstName = contact.firstName ?? "there";
    const defaultMsg = `Hi ${firstName}! Thank you for choosing ${brandName}. We'd love to hear your feedback — could you take a moment to leave us a review? ${link} — ${brandName}`;
    const message = (customMessage ?? defaultMsg)
      .replace(/{{first_name}}/gi, firstName)
      .replace(/{{business_name}}/gi, brandName)
      .replace(/{{review_link}}/gi, link);

    try {
      if (channel === "sms" || channel === "both") {
        if (contact.phone && workspace.twilioSubAccountSid && workspace.twilioSubAccountToken) {
          const client = twilio(workspace.twilioSubAccountSid, workspace.twilioSubAccountToken);
          await client.messages.create({
            from: workspace.twilioPhoneNumber!,
            to: contact.phone,
            body: message,
          });
        }
      }

      if (channel === "email" || channel === "both") {
        if (contact.email) {
          const fromEmail = workspace.fromEmail ?? process.env.RESEND_FROM_EMAIL ?? "noreply@stactoro.app";
          const emailClient = workspace.resendApiKey ? { emails: resend.emails } : resend;
          await emailClient.emails.send({
            from: `${brandName} <${fromEmail}>`,
            to: contact.email,
            subject: `How was your experience with ${brandName}?`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
                <h2 style="color:#111;margin-bottom:8px;">Hi ${firstName}! 👋</h2>
                <p style="color:#555;line-height:1.6;">Thank you for choosing <strong>${brandName}</strong>. We hope you had a great experience!</p>
                <p style="color:#555;line-height:1.6;">Your feedback means the world to us. Could you take 30 seconds to share your thoughts?</p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${link}" style="display:inline-block;padding:14px 32px;background:#F59E0B;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">⭐ Leave a Review</a>
                </div>
                <p style="color:#888;font-size:13px;text-align:center;">It only takes 30 seconds and helps us serve you better.</p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                <p style="color:#aaa;font-size:12px;text-align:center;">${brandName}</p>
              </div>
            `,
          });
        }
      }
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: contacts.length });
}
