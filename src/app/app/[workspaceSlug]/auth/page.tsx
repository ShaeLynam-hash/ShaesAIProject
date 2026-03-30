import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRound, Users, Shield, ArrowRight } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function AuthOverviewPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { _count: { select: { apiKeys: true, members: true } } },
  });
  if (!workspace) redirect("/onboarding");

  const stats = [
    { label: "Total Users",     value: workspace._count.members, icon: Users,    href: "auth/users",    desc: "Workspace members" },
    { label: "API Keys",        value: workspace._count.apiKeys, icon: KeyRound, href: "auth/api-keys", desc: "Active keys" },
    { label: "Active Sessions", value: "—",                      icon: Shield,   href: "auth/sessions", desc: "Live sessions" },
  ];

  const sections = [
    { title: "Users",    desc: "Manage members, roles, and access",              href: "auth/users",    icon: Users },
    { title: "API Keys", desc: "Create and revoke keys with scoped permissions", href: "auth/api-keys", icon: KeyRound },
    { title: "Sessions", desc: "View and revoke active user sessions",           href: "auth/sessions", icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>Auth Platform</h2>
        <p className="text-sm mt-1" style={{ color: "var(--obs-muted)" }}>
          Manage users, API keys, and sessions for {workspace.name}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, desc }) => (
          <Link key={label} href={`/app/${workspaceSlug}/${href}`}
            className="group p-5 rounded-xl border transition-all"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--obs-elevated)" }}>
                <Icon size={15} style={{ color: "var(--obs-accent)" }} />
              </div>
              <ArrowRight size={13} style={{ color: "var(--obs-muted)" }} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--obs-text)" }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: "var(--obs-text)" }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{desc}</p>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--obs-muted)" }}>Manage</h3>
        <div className="grid grid-cols-3 gap-4">
          {sections.map(({ title, desc, href, icon: Icon }) => (
            <Link key={title} href={`/app/${workspaceSlug}/${href}`}
              className="group flex items-start gap-4 p-5 rounded-xl border transition-all"
              style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--obs-elevated)" }}>
                <Icon size={18} style={{ color: "var(--obs-accent)" }} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--obs-text)" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--obs-muted)" }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
