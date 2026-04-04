import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "",
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, workspaceSlug } = await req.json();
  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${appUrl}/app/${workspaceSlug}/settings/billing?success=true`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { workspaceId: workspace.id, plan },
    },
    metadata: { workspaceId: workspace.id, plan },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
