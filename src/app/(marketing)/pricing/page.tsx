import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 470 },
    desc: "Perfect for small businesses and solopreneurs",
    features: [
      "1 Workspace",
      "1,000 contacts",
      "3 team members",
      "Email marketing",
      "Basic CRM",
      "Payments & invoicing",
      "5GB storage",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: { monthly: 99, annual: 950 },
    desc: "For growing businesses that need more power",
    features: [
      "3 Workspaces",
      "10,000 contacts",
      "10 team members",
      "Everything in Starter",
      "Automations & workflows",
      "Landing page builder",
      "SMS marketing",
      "Advanced analytics",
      "Priority support",
      "50GB storage",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: { monthly: 249, annual: 2390 },
    desc: "For agencies managing multiple clients",
    features: [
      "Unlimited Workspaces",
      "Unlimited contacts",
      "Unlimited team members",
      "Everything in Pro",
      "White-label branding",
      "Client reporting",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited storage",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes! Every plan includes a 14-day free trial with no credit card required. You get full access to all features during your trial." },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time from your billing settings. Changes take effect immediately." },
  { q: "What happens to my data if I cancel?", a: "Your data is retained for 30 days after cancellation. You can export everything in CSV or JSON format before your account closes." },
  { q: "Do you offer annual billing discounts?", a: "Yes — annual billing saves you approximately 20% compared to monthly billing. Switch anytime from your billing settings." },
  { q: "Is there a limit on how many contacts I can import?", a: "Starter: 1,000. Pro: 10,000. Agency: unlimited. Contacts above your limit are paused, not deleted." },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 px-6 text-center bg-white">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Pricing</p>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Start free for 14 days. No credit card required. Cancel anytime.</p>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-8 flex flex-col ${
                plan.highlight
                  ? "border-blue-500 bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>{plan.desc}</p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>${plan.price.monthly}</span>
                <span className={`text-sm ml-1 ${plan.highlight ? "text-blue-100" : "text-slate-400"}`}>/mo</span>
                <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>or ${plan.price.annual}/yr (save 20%)</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={15} className={plan.highlight ? "text-blue-200" : "text-green-500"} />
                    <span className={plan.highlight ? "text-blue-50" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === "Agency" ? "/contact" : "/signup"}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
