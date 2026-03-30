import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL, APP_NAME, APP_URL } from "@/lib/resend";
import type Stripe from "stripe";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (!workspaceId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPrice(priceId);

      const subAny = sub as unknown as { current_period_end: number };
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          subscriptionStatus: "ACTIVE",
          plan,
          currentPeriodEnd: new Date(subAny.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const workspace = await prisma.workspace.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!workspace) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPrice(priceId);
      const status = stripeStatusToEnum(sub.status);

      const subAny2 = sub as unknown as { current_period_end: number };
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          stripePriceId: priceId,
          subscriptionStatus: status,
          plan,
          currentPeriodEnd: new Date(subAny2.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspace = await prisma.workspace.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!workspace) break;

      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { subscriptionStatus: "CANCELED" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const workspace = await prisma.workspace.findUnique({
        where: { stripeCustomerId: invoice.customer as string },
        include: { members: { where: { role: "OWNER" }, include: { user: true } } },
      });
      if (!workspace) break;

      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { subscriptionStatus: "PAST_DUE" },
      });

      const owner = workspace.members[0]?.user;
      if (owner?.email) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: owner.email,
          subject: `Action required: payment failed for your ${APP_NAME} subscription`,
          html: paymentFailedEmailHtml(owner.name ?? "there", workspace.slug),
        });
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      const workspace = await prisma.workspace.findUnique({
        where: { stripeSubscriptionId: sub.id },
        include: { members: { where: { role: "OWNER" }, include: { user: true } } },
      });
      if (!workspace) break;

      const owner = workspace.members[0]?.user;
      if (owner?.email) {
        const trialEnd = new Date(sub.trial_end! * 1000).toLocaleDateString();
        await resend.emails.send({
          from: FROM_EMAIL,
          to: owner.email,
          subject: `Your trial ends in 3 days — don't lose your data`,
          html: trialEndingEmailHtml(owner.name ?? "there", workspace.slug, trialEnd),
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPrice(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) return "PRO";
  if (priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY || priceId === process.env.STRIPE_PRICE_AGENCY_ANNUAL) return "AGENCY";
  return "STARTER";
}

function stripeStatusToEnum(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
  };
  return map[status] ?? "INCOMPLETE";
}

function paymentFailedEmailHtml(name: string, slug: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#DC2626;">Payment Failed</h1>
      <p style="color:#475569;">Hi ${name}, your recent payment for ${APP_NAME} failed. Please update your payment method to keep your account active.</p>
      <a href="${APP_URL}/app/${slug}/settings/billing" style="display:inline-block;background:#3B82F6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">Update Payment Method →</a>
      <p style="color:#CBD5E1;font-size:12px;">© 2025 ${APP_NAME}. All rights reserved.</p>
    </div>
  `;
}

function trialEndingEmailHtml(name: string, slug: string, trialEnd: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#0F172A;">Your trial ends soon</h1>
      <p style="color:#475569;">Hi ${name}, your ${APP_NAME} free trial ends on <strong>${trialEnd}</strong>. Upgrade now to keep access to all your data and features.</p>
      <a href="${APP_URL}/app/${slug}/settings/billing" style="display:inline-block;background:#3B82F6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">Upgrade Now →</a>
      <p style="color:#94A3B8;font-size:14px;">If you don't upgrade, your account will be restricted after your trial ends.</p>
      <p style="color:#CBD5E1;font-size:12px;">© 2025 ${APP_NAME}. All rights reserved.</p>
    </div>
  `;
}
