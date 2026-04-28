import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state");
  if (!code || !stateRaw) return NextResponse.redirect(new URL("/app?error=gmail_callback", req.url));

  let workspaceSlug = "";
  try {
    const state = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
    workspaceSlug = state.workspaceSlug;
  } catch {
    return NextResponse.redirect(new URL("/app?error=gmail_state", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/gmail/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });

  if (!tokenRes.ok) return NextResponse.redirect(new URL(`/app/${workspaceSlug}/integrations?error=gmail_token`, req.url));
  const tokens = await tokenRes.json();

  // Get user email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = userRes.ok ? await userRes.json() : {};

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.redirect(new URL("/app?error=workspace", req.url));

  const expiry = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined;
  await prisma.workspaceIntegration.upsert({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "gmail" } },
    create: {
      workspaceId: workspace.id, provider: "gmail",
      accessToken: tokens.access_token, refreshToken: tokens.refresh_token,
      tokenExpiry: expiry, config: { email: userInfo.email }, status: "active",
    },
    update: {
      accessToken: tokens.access_token, refreshToken: tokens.refresh_token ?? undefined,
      tokenExpiry: expiry, config: { email: userInfo.email }, status: "active", errorMsg: null,
    },
  });

  // Update workspace fromEmail
  if (userInfo.email) {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { fromEmail: userInfo.email },
    });
  }

  return NextResponse.redirect(new URL(`/app/${workspaceSlug}/integrations?connected=gmail`, req.url));
}
