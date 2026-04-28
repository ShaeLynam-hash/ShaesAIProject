import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", req.url));

  const workspaceSlug = req.nextUrl.searchParams.get("workspace") ?? "";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/gmail/callback`;

  if (!clientId) return NextResponse.json({ error: "Google not configured" }, { status: 500 });

  const state = Buffer.from(JSON.stringify({ workspaceSlug, userId: session.user.id })).toString("base64url");
  const scopes = ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/userinfo.email"].join(" ");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
