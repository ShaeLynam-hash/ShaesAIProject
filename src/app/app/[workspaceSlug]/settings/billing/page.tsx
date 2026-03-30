"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, CheckCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLANS } from "@/lib/stripe";

const planFeatures = {
  STARTER: ["1 Workspace", "1,000 Contacts", "3 Team Members", "Email Marketing", "Basic CRM", "Payments"],
  PRO: ["3 Workspaces", "10,000 Contacts", "10 Team Members", "Everything in Starter", "Automations", "Landing Pages", "SMS", "Analytics"],
  AGENCY: ["Unlimited Workspaces", "Unlimited Contacts", "Unlimited Team Members", "Everything in Pro", "White-label", "Client Reporting", "Priority Support"],
};

export default function BillingPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    const priceId = billing === "monthly" ? plan.monthly : plan.annual;
    setLoading(planKey);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, priceId, billing }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else {
      toast.error("Failed to open checkout");
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing &amp; Plans</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your subscription and payment details.</p>
        </div>
        <Button variant="outline" onClick={handlePortal}>
          <CreditCard size={16} className="mr-2" /> Manage Billing
        </Button>
      </div>

      {/* Usage */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Current Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Contacts", used: 0, limit: 1000 },
            { label: "Team Members", used: 1, limit: 3 },
            { label: "Workspaces", used: 1, limit: 1 },
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

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-blue-600" : "bg-slate-300"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === "annual" ? "translate-x-7" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium ${billing === "annual" ? "text-slate-900" : "text-slate-400"}`}>
          Annual <span className="text-green-600 text-xs font-bold">Save 20%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card key={key} className={`border-2 ${key === "PRO" ? "border-blue-500" : "border-slate-200"} relative`}>
            {key === "PRO" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  ${billing === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)}
                </span>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              {billing === "annual" && (
                <p className="text-xs text-green-600">Billed ${plan.annualPrice}/yr</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {planFeatures[key as keyof typeof planFeatures].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${key === "PRO" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                variant={key === "PRO" ? "default" : "outline"}
                disabled={loading === key}
                onClick={() => handleUpgrade(key)}
              >
                {loading === key ? "Loading…" : `Upgrade to ${plan.name}`}
                <ArrowUpRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
