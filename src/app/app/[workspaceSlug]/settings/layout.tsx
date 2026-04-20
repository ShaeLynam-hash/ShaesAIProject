"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Settings, CreditCard, Users, MessageSquare, MessageCircle } from "lucide-react";

const tabs = [
  { label: "General",        href: "",                icon: Settings        },
  { label: "Billing",        href: "/billing",        icon: CreditCard      },
  { label: "Team",           href: "/team",           icon: Users           },
  { label: "Communications", href: "/communications", icon: MessageSquare   },
  { label: "Live Chat",      href: "/chat",           icon: MessageCircle   },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const base = `/app/${params.workspaceSlug}/settings`;

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-1 border-b mb-6 overflow-x-auto"
        style={{ borderColor: "var(--obs-border)" }}>
        {tabs.map(({ label, href, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          return (
            <Link key={label} href={fullHref}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${isActive ? "border-[var(--obs-accent)]" : "border-transparent hover:border-[var(--obs-border)]"}`}
              style={{ color: isActive ? "var(--obs-accent)" : "var(--obs-muted)" }}>
              <Icon size={13} />{label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
