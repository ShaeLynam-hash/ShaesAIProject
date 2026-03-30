"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Mail, CreditCard, Calendar,
  FileText, Zap, MessageSquare, BarChart3, Settings, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "dashboard", icon: LayoutDashboard, active: true },
  { label: "CRM", href: "crm", icon: Users, soon: true },
  { label: "Email Marketing", href: "email", icon: Mail, soon: true },
  { label: "Payments", href: "payments", icon: CreditCard, soon: true },
  { label: "Calendar", href: "calendar", icon: Calendar, soon: true },
  { label: "Pages", href: "pages", icon: FileText, soon: true },
  { label: "Automations", href: "automations", icon: Zap, soon: true },
  { label: "SMS", href: "sms", icon: MessageSquare, soon: true },
  { label: "Analytics", href: "analytics", icon: BarChart3, soon: true },
];

interface SidebarProps {
  workspaceSlug: string;
}

export function Sidebar({ workspaceSlug }: SidebarProps) {
  const pathname = usePathname();
  const base = `/app/${workspaceSlug}`;

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0">
      <div className="p-4 border-b border-slate-800">
        <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, soon }) => {
          const fullHref = `${base}/${href}`;
          const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);

          return (
            <Link
              key={href}
              href={soon ? "#" : fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : soon
                  ? "text-slate-500 cursor-not-allowed hover:bg-transparent"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              onClick={soon ? (e) => e.preventDefault() : undefined}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {soon && (
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500 py-0">
                  Soon
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-0.5">
        <Link
          href={`${base}/settings`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith(`${base}/settings`)
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings size={18} />
          Settings
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <HelpCircle size={18} />
          Help &amp; Support
        </Link>
      </div>
    </aside>
  );
}
