import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stactoro-logo-wide.jpg" alt="Stactoro" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link href="/#testimonials" className="text-sm text-slate-600 hover:text-slate-900">Customers</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Log In</Link>
            <Link href="/signup" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/stactoro-logo-wide.jpg" alt="Stactoro" style={{ height: 32, width: "auto", objectFit: "contain" }} />
              </div>
              <p className="text-xs text-slate-500">The all-in-one business operating system.</p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Support", links: ["Documentation", "Help Center", "Status", "Contact"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">{heading}</h4>
                <ul className="space-y-2">
                  {links.map((l) => <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-slate-900">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">© 2025 Stactoro. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Security"].map((l) => <a key={l} href="#" className="text-xs text-slate-400 hover:text-slate-900">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
