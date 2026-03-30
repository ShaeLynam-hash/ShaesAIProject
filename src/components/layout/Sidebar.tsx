"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Mail, CreditCard, Calendar,
  FileText, Zap, MessageSquare, BarChart3, Settings,
  HelpCircle, Database, KeyRound, HardDrive, Webhook, Bot,
  Headphones, UserCheck, Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const navItems = [
  { label: "Dashboard",    href: "dashboard",   icon: LayoutDashboard, active: true  },
  { label: "Auth",         href: "auth",         icon: KeyRound,        active: true  },
  { label: "Payments",     href: "payments",     icon: CreditCard,      active: true  },
  { label: "CRM",          href: "crm",          icon: Users,           active: true  },
  { label: "Email",        href: "email",        icon: Mail,            active: true  },
  { label: "SMS",          href: "sms",          icon: MessageSquare,   active: true  },
  { label: "AI",           href: "ai",           icon: Bot,             active: true  },
  { label: "Storage",      href: "storage",      icon: HardDrive,       active: true  },
  { label: "Analytics",    href: "analytics",    icon: BarChart3,       active: true  },
  { label: "Automations",  href: "automations",  icon: Zap,             active: true  },
  { label: "Database",     href: "database",     icon: Database,        active: true  },
  { label: "Support",      href: "support",      icon: Headphones,      active: true  },
  { label: "HR",           href: "hr",           icon: UserCheck,       active: true  },
  { label: "Documents",    href: "documents",    icon: FileText,        active: true  },
  { label: "Calendar",     href: "calendar",     icon: Calendar,        active: true  },
  { label: "Webhooks",     href: "webhooks",     icon: Webhook,         active: true  },
];

interface SidebarProps {
  workspaceSlug: string;
}

export function Sidebar({ workspaceSlug }: SidebarProps) {
  const pathname = usePathname();
  const base = `/app/${workspaceSlug}`;

  return (
    <aside className="flex flex-col w-[220px] min-h-screen shrink-0 border-r"
      style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>

      {/* Workspace switcher */}
      <div className="p-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, active }) => {
          const fullHref = `${base}/${href}`;
          const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const isDisabled = !active;

          return (
            <Link
              key={href}
              href={isDisabled ? "#" : fullHref}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "text-white"
                  : isDisabled
                  ? "opacity-35 cursor-not-allowed"
                  : "hover:text-white"
              )}
              style={
                isActive
                  ? { background: "var(--obs-accent)", color: "#fff" }
                  : { color: "var(--sidebar-foreground)" }
              }
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {isDisabled && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t space-y-0.5" style={{ borderColor: "var(--sidebar-border)" }}>
        <Link
          href={`${base}/settings`}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all",
            pathname.startsWith(`${base}/settings`) ? "text-white" : "hover:text-white"
          )}
          style={
            pathname.startsWith(`${base}/settings`)
              ? { background: "var(--obs-accent)" }
              : { color: "var(--sidebar-foreground)" }
          }
        >
          <Settings size={15} />
          Settings
        </Link>
        <Link href="#"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all hover:text-white"
          style={{ color: "var(--sidebar-foreground)" }}
        >
          <HelpCircle size={15} />
          Help
        </Link>
      </div>
    </aside>
  );
}
