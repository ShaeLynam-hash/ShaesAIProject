"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Users, Receipt, Package, TrendingDown, BarChart3, RefreshCw, BookOpen, BookMarked, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview",       href: "",               icon: LayoutDashboard },
  { label: "Customers",      href: "/customers",     icon: Users           },
  { label: "Invoices",       href: "/invoices",      icon: Receipt         },
  { label: "Subscriptions",  href: "/subscriptions", icon: RefreshCw       },
  { label: "Products",       href: "/products",      icon: Package         },
  { label: "Expenses",       href: "/expenses",      icon: TrendingDown    },
  { label: "Accounts",       href: "/accounts",      icon: BookOpen        },
  { label: "Ledger",         href: "/ledger",        icon: BookMarked      },
  { label: "Balance Sheet",  href: "/balance-sheet", icon: Scale           },
  { label: "Reports",        href: "/reports",       icon: BarChart3       },
];

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const base = `/app/${params.workspaceSlug}/payments`;

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="flex items-center gap-1 border-b pb-0 mb-6 overflow-x-auto"
        style={{ borderColor: "var(--obs-border)" }}>
        {tabs.map(({ label, href, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          return (
            <Link key={label} href={fullHref}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-[var(--obs-accent)]"
                  : "border-transparent hover:border-[var(--obs-border)]"
              )}
              style={{ color: isActive ? "var(--obs-accent)" : "var(--obs-muted)" }}>
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
