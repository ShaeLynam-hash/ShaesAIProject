import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { Plan, SubscriptionStatus } from "@prisma/client";

function toPlan(raw: string | undefined): Plan {
  const map: Record<string, Plan> = {
    starter: Plan.STARTER,
    pro: Plan.PRO,
    enterprise: Plan.ENTERPRISE,
    agency: Plan.AGENCY,
  };
  return map[raw?.toLowerCase() ?? ""] ?? Plan.FREE;
}

function toStatus(raw: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    trialing: SubscriptionStatus.TRIALING,
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    incomplete: SubscriptionStatus.INCOMPLETE,
  };
  return map[raw] ?? SubscriptionStatus.TRIALING;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sub = event.data.object as Stripe.Subscription;

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const workspaceId = sub.metadata?.workspaceId;
    const plan = sub.metadata?.plan;
    if (workspaceId) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: toPlan(plan),
          subscriptionStatus: toStatus(sub.status),
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer as string,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const workspaceId = sub.metadata?.workspaceId;
    if (workspaceId) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: Plan.FREE,
          subscriptionStatus: SubscriptionStatus.CANCELED,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
