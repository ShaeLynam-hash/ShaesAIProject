import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function refreshQBToken(integration: any, workspaceId: string) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: integration.refreshToken }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  const tokens = await res.json();
  const expiry = new Date(Date.now() + tokens.expires_in * 1000);
  const updated = await prisma.workspaceIntegration.update({
    where: { workspaceId_provider: { workspaceId, provider: "quickbooks" } },
    data: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiry: expiry },
  });
  return updated.accessToken;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await req.json();
  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId: session.user.id } } },
    include: { integrations: { where: { provider: "quickbooks" } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const integration = workspace.integrations[0];
  if (!integration?.accessToken) return NextResponse.json({ error: "QuickBooks not connected" }, { status: 400 });

  const config = integration.config as { realmId: string } | null;
  const realmId = config?.realmId;
  if (!realmId) return NextResponse.json({ error: "Missing realmId" }, { status: 400 });

  // Refresh token if expired
  let accessToken: string = integration.accessToken;
  if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
    const refreshed = await refreshQBToken(integration, workspace.id);
    if (refreshed) accessToken = refreshed;
  }

  const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}`;
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/json" };

  let invoicesImported = 0;
  let expensesImported = 0;

  // Pull invoices
  try {
    const invRes = await fetch(`${baseUrl}/query?query=SELECT * FROM Invoice MAXRESULTS 100&minorversion=65`, { headers });
    if (invRes.ok) {
      const invData = await invRes.json();
      const invoices = invData.QueryResponse?.Invoice ?? [];
      for (const inv of invoices) {
        const total = inv.TotalAmt ?? 0;
        const dueDate = inv.DueDate ? new Date(inv.DueDate) : new Date(Date.now() + 30 * 86400000);
        const issueDate = inv.TxnDate ? new Date(inv.TxnDate) : new Date();
        const isPaid = inv.Balance === 0;
        await prisma.invoice.upsert({
          where: { workspaceId_number: { workspaceId: workspace.id, number: `QB-${inv.Id}` } },
          create: {
            workspaceId: workspace.id,
            number: `QB-${inv.Id}`,
            status: isPaid ? "PAID" : "SENT",
            issueDate,
            dueDate,
            total,
            subtotal: total,
            paidAt: isPaid ? issueDate : undefined,
          },
          update: {
            status: isPaid ? "PAID" : "SENT",
            total,
            subtotal: total,
            paidAt: isPaid ? issueDate : undefined,
          },
        });
        invoicesImported++;
      }
    }
  } catch (e) {
    console.error("QB invoice sync error:", e);
  }

  // Pull expenses (Purchases)
  try {
    const expRes = await fetch(`${baseUrl}/query?query=SELECT * FROM Purchase MAXRESULTS 100&minorversion=65`, { headers });
    if (expRes.ok) {
      const expData = await expRes.json();
      const purchases = expData.QueryResponse?.Purchase ?? [];
      for (const p of purchases) {
        const amount = p.TotalAmt ?? 0;
        const date = p.TxnDate ? new Date(p.TxnDate) : new Date();
        const vendor = p.EntityRef?.name ?? "Unknown Vendor";
        const description = p.PrivateNote ?? p.PaymentMethodRef?.name ?? "QuickBooks expense";
        await prisma.expense.create({
          data: {
            workspaceId: workspace.id,
            description: `${description} (QB-${p.Id})`,
            amount,
            category: p.AccountRef?.name ?? "General",
            date,
            vendor,
          },
        }).catch(() => {}); // skip duplicates
        expensesImported++;
      }
    }
  } catch (e) {
    console.error("QB expense sync error:", e);
  }

  await prisma.workspaceIntegration.update({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "quickbooks" } },
    data: { lastSyncAt: new Date(), syncCount: { increment: invoicesImported + expensesImported } },
  });

  return NextResponse.json({ invoicesImported, expensesImported });
}
