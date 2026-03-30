import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, priceId, billing } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: workspace.stripeCustomerId ?? undefined,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app/${workspaceSlug}/settings/billing?success=true`,
    cancel_url: `${appUrl}/app/${workspaceSlug}/settings/billing?canceled=true`,
    metadata: { workspaceId: workspace.id, workspaceSlug },
    subscription_data: {
      trial_period_days: workspace.subscriptionStatus === "TRIALING" ? 14 : undefined,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
