import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { slugify } from "@/lib/workspace";
import { createWorkspaceSchema } from "@/lib/validators/workspace";
import { resend, FROM_EMAIL, APP_NAME } from "@/lib/resend";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
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

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Create Stripe customer (non-fatal if it fails)
  let stripeCustomerId: string | undefined;
  try {
    const stripeCustomer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name,
      metadata: { userId: session.user.id },
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
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  // Send welcome email (non-fatal if it fails)
  if (user?.email) {
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#0F172A;">Welcome to ${APP_NAME}, ${name}!</h1>
      <p style="color:#475569;">Your workspace is ready. You have a <strong>14-day free trial</strong> — no credit card required.</p>
      <a href="${appUrl}/app/${slug}/dashboard" style="display:inline-block;background:#3B82F6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">Go to Dashboard →</a>
      <p style="color:#94A3B8;font-size:14px;">Quick tips to get started:<br>• Add your first contact<br>• Invite a team member<br>• Connect a payment method</p>
      <p style="color:#CBD5E1;font-size:12px;">© 2025 ${APP_NAME}. All rights reserved.</p>
    </div>
  `;
}
