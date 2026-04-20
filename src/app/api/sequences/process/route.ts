import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

// Called by Vercel Cron (or manually) to send due sequence emails.
// Vercel cron config: vercel.json → { "crons": [{ "path": "/api/sequences/process", "schedule": "0 * * * *" }] }
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dueEnrollments = await prisma.sequenceEnrollment.findMany({
    where: { status: "ACTIVE", nextSendAt: { lte: now } },
    include: {
      sequence: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
      contact:  { select: { id: true, firstName: true, lastName: true, email: true } },
      workspace: { select: { id: true, fromEmail: true, fromName: true, resendApiKey: true } },
    },
    take: 100,
  });

  let sent = 0;
  let failed = 0;

  for (const enrollment of dueEnrollments) {
    const nextStepNumber = enrollment.currentStep + 1;
    const step = enrollment.sequence.steps.find((s) => s.stepNumber === nextStepNumber);

    if (!step) {
      // Sequence complete
      await prisma.sequenceEnrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", completedAt: now } });
      continue;
    }

    const toEmail = enrollment.contact.email;
    if (!toEmail) {
      failed++;
      continue;
    }

    const fromEmail = step.fromEmail ?? enrollment.workspace.fromEmail ?? process.env.RESEND_FROM_EMAIL ?? "noreply@stactoro.app";
    const fromName  = step.fromName  ?? enrollment.workspace.fromName  ?? "Stactoro";

    // Personalize tokens
    const firstName = enrollment.contact.firstName;
    const personalize = (s: string) => s
      .replace(/\{\{first_name\}\}/gi, firstName)
      .replace(/\{\{last_name\}\}/gi, enrollment.contact.lastName ?? "")
      .replace(/\{\{email\}\}/gi, toEmail);

    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: toEmail,
        subject: personalize(step.subject),
        html: personalize(step.body).replace(/\n/g, "<br>"),
      });

      // Find next step delay
      const nextStep = enrollment.sequence.steps.find((s) => s.stepNumber === nextStepNumber + 1);
      const nextSendAt = nextStep ? new Date(Date.now() + nextStep.delayDays * 86400000) : null;

      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextStepNumber,
          nextSendAt,
          status: nextStep ? "ACTIVE" : "COMPLETED",
          completedAt: nextStep ? null : now,
        },
      });
      sent++;
    } catch (e) {
      console.error("Sequence email failed:", e);
      failed++;
    }
  }

  return NextResponse.json({ processed: dueEnrollments.length, sent, failed });
}
