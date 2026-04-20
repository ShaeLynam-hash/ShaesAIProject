import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

// Plan → monthly SMS limit
const PLAN_LIMITS: Record<string, number> = {
  FREE:       100,
  STARTER:    500,
  PRO:        2000,
  AGENCY:     10000,
  ENTERPRISE: 99999,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await req.json();
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const masterSid   = process.env.TWILIO_ACCOUNT_SID;
  const masterToken = process.env.TWILIO_AUTH_TOKEN;
  if (!masterSid || !masterToken) {
    return NextResponse.json({ error: "Platform Twilio credentials not configured" }, { status: 500 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Already provisioned
  if (workspace.twilioSubAccountSid) {
    return NextResponse.json({ alreadyProvisioned: true, subAccountSid: workspace.twilioSubAccountSid });
  }

  try {
    const master = twilio(masterSid, masterToken);

    // Create sub-account under master
    const subAccount = await master.api.v2010.accounts.create({
      friendlyName: `${workspace.name} (${workspace.slug})`,
    });

    const limit = PLAN_LIMITS[workspace.plan] ?? 100;

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        twilioSubAccountSid:   subAccount.sid,
        twilioSubAccountToken: subAccount.authToken,
        smsMonthlyLimit:       limit,
        smsUsageResetAt:       new Date(),
      },
    });

    return NextResponse.json({ subAccountSid: subAccount.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Twilio provisioning failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
