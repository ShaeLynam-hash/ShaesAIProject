"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, CheckCircle, ArrowUpRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 49,
    features: [
      "Up to 3 team members",
      "All core modules",
      "1,000 email sends/mo",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 99,
    featured: true,
    features: [
      "Up to 10 team members",
      "All modules + AI assistant",
      "10,000 email sends/mo",
      "Advanced analytics + reports",
      "Priority support",
      "Custom branding",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 249,
    features: [
      "Unlimited team members",
      "Everything in Pro",
      "Unlimited emails",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label option",
    ],
  },
];

interface WorkspaceBilling {
  plan: string;
  planStatus: string;
  trialEndsAt: string | null;
}

export default function BillingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [loading, setLoading] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceBilling | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to Stactoro.");
    }
    // Fetch workspace billing info
    fetch(`/api/workspaces/${workspaceSlug}/billing`)
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setWorkspace(d);
      })
      .catch(() => null);
  }, [workspaceSlug, searchParams]);

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, workspaceSlug }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error ?? "Failed to open checkout");
        setLoading(null);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else toast.error("Failed to open billing portal");
  };

  const currentPlanKey = workspace?.plan?.toLowerCase() ?? "free";
  const isTrialing = workspace?.planStatus?.toLowerCase() === "trialing";
  const trialDaysLeft = workspace?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(workspace.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const planStatusLabel = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      trialing: { label: "Trial", variant: "secondary" },
      active: { label: "Active", variant: "default" },
      past_due: { label: "Past Due", variant: "destructive" },
      canceled: { label: "Cancelled", variant: "destructive" },
      free: { label: "Free", variant: "outline" },
    };
    return map[status?.toLowerCase()] ?? { label: status, variant: "outline" };
  };

  const statusInfo = planStatusLabel(workspace?.planStatus ?? "free");

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing &amp; Plans</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your Stactoro subscription.</p>
        </div>
        <Button variant="outline" onClick={handlePortal}>
          <CreditCard size={16} className="mr-2" /> Manage Billing
        </Button>
      </div>

      {/* Current plan status */}
      {workspace && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              Current Plan
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span className="font-semibold text-slate-700 capitalize">{currentPlanKey}</span>
            </CardTitle>
          </CardHeader>
          {isTrialing && trialDaysLeft !== null && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Zap size={15} className="shrink-0" />
                <span>
                  Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>.
                  Upgrade to keep full access.
                </span>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Usage */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Current Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Contacts", used: 0, limit: 1000 },
            { label: "Team Members", used: 1, limit: 3 },
            { label: "Email Sends this month", used: 0, limit: 1000 },
          ].map(({ label, used, limit }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-700 font-medium">{label}</span>
                <span className="text-slate-500">{used} / {limit}</span>
              </div>
              <Progress value={(used / limit) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanKey === plan.key;
          return (
            <Card
              key={plan.key}
              className={`border-2 relative ${
                plan.featured ? "border-indigo-500" : "border-slate-200"
              } ${isCurrent ? "bg-slate-50" : ""}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.featured ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  variant={plan.featured ? "default" : "outline"}
                  disabled={loading === plan.key || isCurrent}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  {isCurrent
                    ? "Current Plan"
                    : loading === plan.key
                    ? "Loading…"
                    : `Upgrade to ${plan.name}`}
                  {!isCurrent && <ArrowUpRight size={14} className="ml-1" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
