import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export default async function AppShellLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) redirect("/onboarding");

  // Redirect canceled workspaces to billing
  const status = workspace.subscriptionStatus;
  const isBillingPage = false; // handled per-page
  if (status === "CANCELED") redirect(`/app/${workspaceSlug}/settings/billing`);

  const pageTitle = workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar workspaceSlug={workspaceSlug} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {status === "PAST_DUE" && (
          <div className="bg-red-600 text-white text-sm text-center py-2 px-4">
            Your payment failed. Please{" "}
            <a href={`/app/${workspaceSlug}/settings/billing`} className="underline font-semibold">
              update your payment method
            </a>{" "}
            to avoid losing access.
          </div>
        )}
        {status === "TRIALING" && workspace.trialEndsAt && (
          <div className="bg-blue-600 text-white text-sm text-center py-2 px-4">
            Free trial — {Math.max(0, Math.ceil((workspace.trialEndsAt.getTime() - Date.now()) / 86400000))} days remaining.{" "}
            <a href={`/app/${workspaceSlug}/settings/billing`} className="underline font-semibold">
              Upgrade now
            </a>
          </div>
        )}
        <Topbar title={pageTitle} workspaceSlug={workspaceSlug} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
