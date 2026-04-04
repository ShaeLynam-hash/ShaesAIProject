import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

function verifyToken(token: string): { clientId: string; workspaceId: string; exp: number } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET ?? "fallback-secret";
    const [data, sig] = token.split(".");
    const expected = createHmac("sha256", secret).update(data).digest("base64");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const { workspaceSlug } = await params;
  const token = req.cookies.get("portal_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace || workspace.id !== payload.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.clientPortalUser.findUnique({ where: { id: payload.clientId } });
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [appointments, invoices] = await Promise.all([
    prisma.appointment.findMany({
      where: { workspaceId: workspace.id, clientEmail: client.email },
      include: { service: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.invoice.findMany({
      where: { workspaceId: workspace.id, customer: { email: client.email } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    client: { name: client.name, email: client.email },
    appointments,
    invoices,
  });
}
