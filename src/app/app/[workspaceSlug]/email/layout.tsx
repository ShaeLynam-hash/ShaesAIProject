"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Send, FileText, GitBranch, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview",   href: "",            icon: LayoutDashboard },
  { label: "Campaigns",  href: "/campaigns",  icon: Send            },
  { label: "Sequences",  href: "/sequences",  icon: GitBranch       },
  { label: "Templates",  href: "/templates",  icon: FileText        },
  { label: "Builder",    href: "/builder",    icon: Layers          },
];

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const base = `/app/${params.workspaceSlug}/email`;
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-1 border-b mb-6" style={{ borderColor: "var(--obs-border)" }}>
        {tabs.map(({ label, href, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = href === "" ? pathname === base : pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          return (
            <Link key={label} href={fullHref} className={cn("flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors", isActive ? "border-[var(--obs-accent)]" : "border-transparent hover:border-[var(--obs-border)]")} style={{ color: isActive ? "var(--obs-accent)" : "var(--obs-muted)" }}>
              <Icon size={13} />{label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
