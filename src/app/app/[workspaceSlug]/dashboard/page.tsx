import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, DollarSign, Mail, Zap, Plus, UserPlus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: { include: { user: true } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!workspace) redirect("/onboarding");

  const stats = [
    { label: "Total Contacts", value: "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue This Month", value: "$0", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Emails Sent", value: "0", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Automations", value: "0", icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const quickActions = [
    { label: "Add Contact", icon: UserPlus, href: "#", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Create Campaign", icon: Mail, href: "#", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Send Invoice", icon: DollarSign, href: "#", color: "bg-green-600 hover:bg-green-700" },
    { label: "New Automation", icon: Zap, href: "#", color: "bg-orange-600 hover:bg-orange-700" },
  ];

  const checklist = [
    { label: "Add your first contact", done: false, href: "#" },
    { label: "Connect a payment method", done: false, href: `/app/${workspaceSlug}/settings/billing` },
    { label: "Invite a teammate", done: workspace.members.length > 1, href: `/app/${workspaceSlug}/settings/team` },
    { label: "Set up your workspace", done: true, href: `/app/${workspaceSlug}/settings` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back 👋</h2>
        <p className="text-slate-500 mt-1">Here's what's happening with <span className="font-medium capitalize">{workspace.name}</span> today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors ${color}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Setup Checklist */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map(({ label, done, href }) => (
              <Link key={label} href={href} className="flex items-center gap-3 group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-blue-400"}`}>
                  {done && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${done ? "line-through text-slate-400" : "text-slate-700 group-hover:text-blue-600"}`}>{label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {workspace.auditLogs.length === 0 ? (
              <div className="text-center py-6">
                <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Actions you take will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workspace.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className="shrink-0 mt-0.5">{log.action}</Badge>
                    <span className="text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
