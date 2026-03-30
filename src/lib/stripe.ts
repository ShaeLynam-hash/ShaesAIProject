import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep `stripe` as a named export for backwards compat — lazily instantiated
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
    monthlyPrice: 49,
    annualPrice: 470,
    limits: { workspaces: 1, contacts: 1000, members: 3 },
  },
  PRO: {
    name: "Pro",
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    monthlyPrice: 99,
    annualPrice: 950,
    limits: { workspaces: 3, contacts: 10000, members: 10 },
  },
  AGENCY: {
    name: "Agency",
    monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY!,
    annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL!,
    monthlyPrice: 249,
    annualPrice: 2390,
    limits: { workspaces: Infinity, contacts: Infinity, members: Infinity },
  },
};
