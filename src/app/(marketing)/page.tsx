import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Mail, CreditCard, Calendar, Zap, BarChart3, Star } from "lucide-react";

const features = [
  { icon: Users, title: "CRM", desc: "Manage contacts, deals, and pipelines. Never lose track of a lead again." },
  { icon: Mail, title: "Email Marketing", desc: "Send beautiful campaigns and automated sequences that convert." },
  { icon: CreditCard, title: "Payments", desc: "Create invoices, accept payments, and manage subscriptions effortlessly." },
  { icon: Zap, title: "Automations", desc: "Build powerful workflows that run your business while you sleep." },
  { icon: BarChart3, title: "Analytics", desc: "Deep insights into every part of your business in one dashboard." },
  { icon: Calendar, title: "Booking & Calendar", desc: "Let clients book appointments directly. Sync with Google Calendar." },
];

const testimonials = [
  { name: "Sarah Chen", role: "CEO, Bright Studio", quote: "We replaced 6 different tools with this platform. It's saved us $800/mo and hours of context switching.", avatar: "SC" },
  { name: "Marcus Williams", role: "Founder, GrowthHQ", quote: "The automation builder alone is worth the price. We've automated our entire onboarding flow in an afternoon.", avatar: "MW" },
  { name: "Priya Nair", role: "COO, Apex Agency", quote: "Finally, a platform that actually does everything it promises. Our team of 15 lives inside it every day.", avatar: "PN" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3B82F620_0%,_transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            Now in public beta — join 500+ businesses
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            The only business platform
            <span className="text-blue-400"> you'll ever need</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            CRM, email marketing, payments, automations, analytics — everything in one place. Stop paying for 10 tools. Start with one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link href="/pricing" className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl text-lg transition-colors">
              See Pricing
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-6">14-day free trial · No credit card required · Cancel anytime</p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-5xl mx-auto mt-16 px-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-500 text-xs ml-2">app.saasplatform.com/workspace/dashboard</span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-700 p-6 gap-0">
              {[["Total Contacts", "0", "↑ Add your first"], ["Revenue", "$0", "↑ Connect Stripe"], ["Emails Sent", "0", "↑ Create campaign"], ["Automations", "0", "↑ Build workflow"]].map(([label, val, hint]) => (
                <div key={label} className="px-4 first:pl-0">
                  <p className="text-slate-400 text-xs mb-1">{label}</p>
                  <p className="text-white text-2xl font-bold">{val}</p>
                  <p className="text-blue-400 text-xs mt-1">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="bg-white border-b border-slate-100 py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 flex-wrap">
          <p className="text-sm text-slate-400 font-medium">Trusted by teams at</p>
          {["Vercel", "Stripe", "Linear", "Notion", "Figma"].map((co) => (
            <span key={co} className="text-slate-400 font-semibold text-lg opacity-40">{co}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Everything you need</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">One platform. Every tool.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Stop juggling subscriptions. Every tool your business needs is built right in.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon size={22} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-blue-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to replace your entire stack?</h2>
          <p className="text-blue-100 mb-8">Join 500+ businesses already running on SaaS Platform.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg hover:bg-blue-50 transition-colors">
            Start Free Trial <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by businesses everywhere</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, quote, avatar }) => (
              <div key={name} className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex mb-4 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
