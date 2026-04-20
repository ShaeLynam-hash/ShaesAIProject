"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Mail, CreditCard, Calendar,
  FileText, Zap, MessageSquare, BarChart3, Settings,
  HelpCircle, Database, KeyRound, HardDrive, Webhook, Bot,
  Headphones, UserCheck, Receipt, CalendarCheck, Puzzle, BookOpen,
  ChevronRight, Inbox, Building2, ScrollText, Star, Globe, MessageCircle,
  Share2, FolderKanban,
} from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard",   href: "dashboard",   icon: LayoutDashboard },
      { label: "Analytics",   href: "analytics",   icon: BarChart3 },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Inbox",       href: "inbox",        icon: Inbox },
      { label: "Live Chat",   href: "chat",         icon: MessageCircle },
      { label: "CRM",         href: "crm",          icon: Users },
      { label: "Email",       href: "email",        icon: Mail },
      { label: "SMS",         href: "sms",          icon: MessageSquare },
      { label: "Support",     href: "support",      icon: Headphones },
    ],
  },
  {
    label: "SALES",
    items: [
      { label: "Accounting",  href: "payments",     icon: Receipt },
      { label: "Proposals",   href: "proposals",    icon: ScrollText },
      { label: "Calendar",    href: "calendar",     icon: Calendar },
      { label: "Booking",     href: "booking",      icon: CalendarCheck },
      { label: "Clients",     href: "clients",      icon: UserCheck },
    ],
  },
  {
    label: "MARKETING",
    items: [
      { label: "Pages",       href: "pages",        icon: Globe },
      { label: "Social",      href: "social",       icon: Share2 },
      { label: "Automations", href: "automations",  icon: Zap },
      { label: "Reviews",     href: "reviews",      icon: Star },
      { label: "Forms",       href: "forms",        icon: FileText },
      { label: "AI",          href: "ai",           icon: Bot },
    ],
  },
  {
    label: "AGENCY",
    items: [
      { label: "Agency",      href: "agency",       icon: Building2 },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Projects",    href: "projects",     icon: FolderKanban },
      { label: "Documents",   href: "documents",    icon: BookOpen },
      { label: "Storage",     href: "storage",      icon: HardDrive },
      { label: "HR",          href: "hr",           icon: UserCheck },
      { label: "Integrations",href: "integrations", icon: Puzzle },
      { label: "Auth",        href: "auth",         icon: KeyRound },
      { label: "Webhooks",    href: "webhooks",     icon: Webhook },
      { label: "Database",    href: "database",     icon: Database },
    ],
  },
];

export function Sidebar({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();
  const base = `/app/${workspaceSlug}`;

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "#0D0D10",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Workspace switcher */}
      <div style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px", scrollbarWidth: "none" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.2)",
              padding: "10px 10px 4px",
              textTransform: "uppercase",
            }}>
              {group.label}
            </p>
            {group.items.map(({ label, href, icon: Icon }) => {
              const fullHref = `${base}/${href}`;
              const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
              return (
                <Link key={href} href={fullHref} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 10px",
                  borderRadius: 7,
                  marginBottom: 1,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
                  borderLeft: isActive ? "2px solid #F59E0B" : "2px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <Icon size={15} style={{ flexShrink: 0, color: isActive ? "#F59E0B" : "rgba(255,255,255,0.35)" }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <ChevronRight size={12} style={{ color: "rgba(245,158,11,0.5)" }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { label: "Settings", href: `${base}/settings`, icon: Settings },
          { label: "Help & Support", href: "#", icon: HelpCircle },
        ].map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(`${base}/settings`) && label === "Settings";
          return (
            <Link key={label} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "7px 10px",
              borderRadius: 7,
              marginBottom: 1,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)",
              background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
              borderLeft: isActive ? "2px solid #F59E0B" : "2px solid transparent",
            }}>
              <Icon size={15} style={{ color: isActive ? "#F59E0B" : "rgba(255,255,255,0.3)" }} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
