import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

function signToken(payload: object): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "fallback-secret";
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = createHmac("sha256", secret).update(data).digest("base64");
  return `${data}.${sig}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const { workspaceSlug } = await params;
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const client = await prisma.clientPortalUser.findUnique({
    where: { workspaceId_email: { workspaceId: workspace.id, email } },
  });

  if (!client || !client.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, client.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const token = signToken({ clientId: client.id, workspaceId: workspace.id, exp: Date.now() + 7 * 86400_000 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("portal_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 86400,
    sameSite: "lax",
  });
  return res;
}
