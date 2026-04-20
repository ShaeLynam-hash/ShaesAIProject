import { redirect } from "next/navigation";
import { getSession, getWorkspaceBySlug } from "@/lib/data";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export default async function AppShellLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);

  if (!workspace || workspace.members.length === 0) redirect("/onboarding");

  const status = workspace.subscriptionStatus;
  if (status === "CANCELED") redirect(`/app/${workspaceSlug}/settings/billing`);

  const trialDays = workspace.trialEndsAt
    ? Math.max(0, Math.ceil((workspace.trialEndsAt.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#08080A" }}>
      <Sidebar workspaceSlug={workspaceSlug} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>
        {/* Past due banner */}
        {status === "PAST_DUE" && (
          <div style={{ background: "#ef4444", color: "#fff", fontSize: 13, textAlign: "center", padding: "8px 16px", fontWeight: 500 }}>
            Your payment failed.{" "}
            <a href={`/app/${workspaceSlug}/settings/billing`} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>
              Update payment method →
            </a>
          </div>
        )}
        {/* Trial banner */}
        {status === "TRIALING" && trialDays !== null && trialDays <= 7 && (
          <div style={{ background: "rgba(245,158,11,0.12)", borderBottom: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: 12, textAlign: "center", padding: "6px 16px", fontWeight: 500 }}>
            {trialDays} days left in your free trial —{" "}
            <a href={`/app/${workspaceSlug}/settings/billing`} style={{ color: "#F59E0B", fontWeight: 700, textDecoration: "underline" }}>
              Upgrade now
            </a>
          </div>
        )}
        <Topbar workspaceSlug={workspaceSlug} workspaceName={workspace.name} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
