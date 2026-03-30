import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTable } from "@/components/settings/TeamTable";
import { InviteModal } from "@/components/settings/InviteModal";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function TeamSettingsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      invites: { where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!workspace) redirect("/onboarding");

  const roleLimits = [
    { role: "Owner", perms: "Full access, billing, delete workspace" },
    { role: "Admin", perms: "Manage members, settings, all modules" },
    { role: "Member", perms: "Access all modules, create/edit data" },
    { role: "Viewer", perms: "Read-only access to all modules" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
          <p className="text-slate-500 text-sm mt-1">Manage who has access to this workspace.</p>
        </div>
        <InviteModal workspaceSlug={workspaceSlug} />
      </div>

      <Card className="border-slate-200">
        <TeamTable
          members={workspace.members}
          workspaceSlug={workspaceSlug}
          currentUserId={session.user.id}
        />
      </Card>

      {workspace.invites.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspace.invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="text-sm">{invite.email}</TableCell>
                    <TableCell><Badge variant="outline">{invite.role}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(invite.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(invite.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 text-xs">Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleLimits.map(({ role, perms }) => (
                <TableRow key={role}>
                  <TableCell className="font-medium text-sm">{role}</TableCell>
                  <TableCell className="text-sm text-slate-500">{perms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
