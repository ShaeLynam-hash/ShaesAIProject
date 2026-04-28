import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const realmId = req.nextUrl.searchParams.get("realmId");
  const stateRaw = req.nextUrl.searchParams.get("state");

  if (!code || !realmId || !stateRaw) {
    return NextResponse.redirect(new URL("/app?error=qb_callback", req.url));
  }

  let workspaceSlug = "";
  try {
    const state = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
    workspaceSlug = state.workspaceSlug;
  } catch {
    return NextResponse.redirect(new URL("/app?error=qb_state", req.url));
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });

  if (!tokenRes.ok) return NextResponse.redirect(new URL(`/app/${workspaceSlug}/integrations?error=qb_token`, req.url));
  const tokens = await tokenRes.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.redirect(new URL("/app?error=workspace", req.url));

  const expiry = new Date(Date.now() + tokens.expires_in * 1000);
  await prisma.workspaceIntegration.upsert({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "quickbooks" } },
    create: {
      workspaceId: workspace.id, provider: "quickbooks",
      accessToken: tokens.access_token, refreshToken: tokens.refresh_token,
      tokenExpiry: expiry, config: { realmId }, status: "active",
    },
    update: {
      accessToken: tokens.access_token, refreshToken: tokens.refresh_token,
      tokenExpiry: expiry, config: { realmId }, status: "active", errorMsg: null,
    },
  });

  return NextResponse.redirect(new URL(`/app/${workspaceSlug}/integrations?connected=quickbooks`, req.url));
}
