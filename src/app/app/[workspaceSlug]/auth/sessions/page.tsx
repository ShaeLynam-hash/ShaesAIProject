import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Monitor, Smartphone, Globe, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props { params: Promise<{ workspaceSlug: string }> }

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return Globe;
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return Smartphone;
  return Monitor;
}

function parseDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Browser";
}

function parseOS(userAgent: string | null): string {
  if (!userAgent) return "";
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "";
}

export default async function AuthSessionsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { members: { select: { userId: true } } },
  });
  if (!workspace) redirect("/onboarding");

  const memberIds = workspace.members.map((m) => m.userId);

  const sessions = await prisma.session.findMany({
    where: { userId: { in: memberIds }, expires: { gt: new Date() } },
    include: { user: true },
    orderBy: { expires: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Active Sessions</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          {sessions.length} active session{sessions.length !== 1 ? "s" : ""} across your workspace
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>User</span><span>Device</span><span>IP Address</span><span>Expires</span><span />
        </div>

        {sessions.length === 0 ? (
          <div className="py-12 text-center">
            <Globe size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No active sessions</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Sessions appear here when users are logged in</p>
          </div>
        ) : sessions.map((s) => {
          const initials = s.user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "U";
          const isCurrentUser = s.userId === session.user?.id;
          const DeviceIcon = getDeviceIcon(s.userAgent ?? null);
          const browser = parseDevice(s.userAgent ?? null);
          const os = parseOS(s.userAgent ?? null);
          const expiresIn = new Date(s.expires).getTime() - Date.now();
          const expiresHours = Math.floor(expiresIn / (1000 * 60 * 60));
          const expiresLabel = expiresHours > 24
            ? `${Math.floor(expiresHours / 24)}d`
            : expiresHours > 0 ? `${expiresHours}h` : "< 1h";

          return (
            <div key={s.sessionToken}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
              style={{ borderColor: "var(--obs-border)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={s.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs font-bold"
                    style={{ background: "var(--obs-elevated)", color: "var(--obs-accent)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>
                      {s.user.name ?? "Unknown"}
                    </p>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "var(--obs-accent)", color: "#fff" }}>You</span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{s.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--obs-elevated)" }}>
                  <DeviceIcon size={13} style={{ color: "var(--obs-accent-2)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{browser}</p>
                  {os && <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{os}</p>}
                </div>
              </div>

              <p className="text-xs font-mono" style={{ color: "var(--obs-muted)" }}>
                {(s as unknown as { ipAddress?: string }).ipAddress ?? "—"}
              </p>

              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--obs-success)" }} />
                <span className="text-xs" style={{ color: "var(--obs-success)" }}>+{expiresLabel}</span>
              </div>

              <button
                className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10"
                title="Revoke session">
                <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
