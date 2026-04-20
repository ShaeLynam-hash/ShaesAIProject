import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { slugify } from "@/lib/workspace";
import { createWorkspaceSchema } from "@/lib/validators/workspace";
import { resend, FROM_EMAIL, APP_NAME } from "@/lib/resend";

export async function POST(req: NextRequest) {
  // NextAuth v5 uses "authjs.session-token" (prod: "__Secure-authjs.session-token")
  const isSecure = req.url.startsWith("https");
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });
  const userId = (token?.id ?? token?.sub) as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, industry, timezone, website } = parsed.data;
  let slug = slugify(name);

  // Ensure slug uniqueness
  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create Stripe customer (non-fatal if it fails)
  let stripeCustomerId: string | undefined;
  try {
    const stripeCustomer = await stripe.customers.create({
      email: user.email ?? undefined,
      name,
      metadata: { userId },
    });
    stripeCustomerId = stripeCustomer.id;
  } catch (e) {
    console.error("Stripe customer creation failed (non-fatal):", e);
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      industry,
      timezone,
      website,
      stripeCustomerId,
      trialEndsAt,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  // Auto-provision Twilio sub-account (non-fatal if it fails)
  const masterSid   = process.env.TWILIO_ACCOUNT_SID;
  const masterToken = process.env.TWILIO_AUTH_TOKEN;
  if (masterSid && masterToken) {
    try {
      const twilio = (await import("twilio")).default;
      const master = twilio(masterSid, masterToken);
      const subAccount = await master.api.v2010.accounts.create({
        friendlyName: `${workspace.name} (${workspace.slug})`,
      });
      const PLAN_LIMITS: Record<string, number> = { FREE: 100, STARTER: 500, PRO: 2000, AGENCY: 10000, ENTERPRISE: 99999 };
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          twilioSubAccountSid:   subAccount.sid,
          twilioSubAccountToken: subAccount.authToken,
          smsMonthlyLimit:       PLAN_LIMITS[workspace.plan] ?? 100,
          smsUsageResetAt:       new Date(),
        },
      });
    } catch (e) {
      console.error("Twilio sub-account provisioning failed (non-fatal):", e);
    }
  }

  // Send welcome email (non-fatal if it fails)
  if (user.email) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Welcome to ${APP_NAME} — let's get you set up`,
        html: welcomeEmailHtml(user.name ?? "there", workspace.slug),
      });
    } catch (e) {
      console.error("Welcome email failed (non-fatal):", e);
    }
  }

  return NextResponse.json({ workspace }, { status: 201 });
}

function welcomeEmailHtml(name: string, slug: string) {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#0F172A;">Welcome to ${APP_NAME}, ${name}!</h1>
      <p style="color:#475569;">Your workspace is ready. You have a <strong>14-day free trial</strong> — no credit card required.</p>
      <a href="${appUrl}/app/${slug}/dashboard" style="display:inline-block;background:#F59E0B;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:24px 0;">Go to Dashboard →</a>
      <p style="color:#CBD5E1;font-size:12px;">© 2025 ${APP_NAME}. All rights reserved.</p>
    </div>
  `;
}
