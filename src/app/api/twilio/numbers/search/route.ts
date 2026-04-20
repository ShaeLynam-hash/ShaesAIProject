import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const areaCode      = req.nextUrl.searchParams.get("areaCode") ?? undefined;
  const country       = req.nextUrl.searchParams.get("country") ?? "US";

  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Use sub-account if provisioned, else master (for search only)
  const sid   = workspace.twilioSubAccountSid   ?? process.env.TWILIO_ACCOUNT_SID;
  const token = workspace.twilioSubAccountToken ?? process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return NextResponse.json({ error: "Twilio not provisioned" }, { status: 400 });

  try {
    const client = twilio(sid, token);
    const numbers = await client.availablePhoneNumbers(country).local.list({
      smsEnabled: true,
      voiceEnabled: false,
      ...(areaCode ? { areaCode: parseInt(areaCode) } : {}),
      limit: 20,
    });

    return NextResponse.json({
      numbers: numbers.map((n) => ({
        phoneNumber:   n.phoneNumber,
        friendlyName:  n.friendlyName,
        region:        n.region,
        locality:      n.locality,
        postalCode:    n.postalCode,
        capabilities:  n.capabilities,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
