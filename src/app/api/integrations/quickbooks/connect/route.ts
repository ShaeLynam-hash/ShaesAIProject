import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", req.url));

  const workspaceSlug = req.nextUrl.searchParams.get("workspace") ?? "";
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`;

  if (!clientId) return NextResponse.json({ error: "QuickBooks not configured" }, { status: 500 });

  const state = Buffer.from(JSON.stringify({ workspaceSlug, userId: session.user.id })).toString("base64url");
  const scope = "com.intuit.quickbooks.accounting";
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
