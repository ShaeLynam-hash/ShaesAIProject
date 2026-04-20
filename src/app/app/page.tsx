// Smart redirect: send logged-in users to their workspace, or onboarding if they have none
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { joinedAt: "asc" },
    select: { workspace: { select: { slug: true } } },
  });

  if (!member) redirect("/onboarding");
  redirect(`/app/${member.workspace.slug}/dashboard`);
}
