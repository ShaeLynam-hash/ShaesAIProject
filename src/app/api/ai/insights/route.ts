import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wid = workspace.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    contacts,
    newContactsThisMonth,
    newContactsLastMonth,
    revThis,
    revLast,
    outstanding,
    overdueInvoices,
    expThis,
    expLast,
    upcomingAppts,
    activeDeals,
    wonDeals,
  ] = await Promise.all([
    prisma.contact.count({ where: { workspaceId: wid } }),
    prisma.contact.count({ where: { workspaceId: wid, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contact.count({ where: { workspaceId: wid, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: "PAID", paidAt: { gte: thirtyDaysAgo } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: "PAID", paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: { in: ["SENT", "OVERDUE"] } }, _sum: { total: true }, _count: true }),
    prisma.invoice.count({ where: { workspaceId: wid, status: "OVERDUE" } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, date: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } }),
    prisma.appointment.count({ where: { workspaceId: wid, date: { gte: now, lte: sevenDaysOut }, status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.deal.aggregate({ where: { workspaceId: wid, stage: { notIn: ["WON", "LOST"] } }, _sum: { value: true }, _count: true }),
    prisma.deal.aggregate({ where: { workspaceId: wid, stage: "WON", updatedAt: { gte: thirtyDaysAgo } }, _sum: { value: true }, _count: true }),
  ]);

  const rev30 = revThis._sum.total ?? 0;
  const revPrev = revLast._sum.total ?? 0;
  const exp30 = expThis._sum.amount ?? 0;
  const expPrev = expLast._sum.amount ?? 0;
  const profit30 = rev30 - exp30;
  const outstandingAmt = outstanding._sum.total ?? 0;

  const dataSnapshot = `
Business: ${workspace.name}${workspace.industry ? ` | Industry: ${workspace.industry}` : ""}
Date: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

REVENUE
- Last 30 days: $${rev30.toFixed(2)} (prev 30d: $${revPrev.toFixed(2)}, change: ${revPrev > 0 ? ((rev30 - revPrev) / revPrev * 100).toFixed(1) : "N/A"}%)
- Net profit (30d): $${profit30.toFixed(2)}
- Outstanding invoices: ${outstanding._count} invoices worth $${outstandingAmt.toFixed(2)}
- Overdue invoices: ${overdueInvoices}

EXPENSES
- Last 30 days: $${exp30.toFixed(2)} (prev 30d: $${expPrev.toFixed(2)})

CONTACTS & CRM
- Total contacts: ${contacts}
- New contacts this month: ${newContactsThisMonth} (prev month: ${newContactsLastMonth})
- Active pipeline deals: ${activeDeals._count} worth $${(activeDeals._sum.value ?? 0).toFixed(2)}
- Deals won this month: ${wonDeals._count} worth $${(wonDeals._sum.value ?? 0).toFixed(2)}

CALENDAR
- Upcoming appointments (next 7 days): ${upcomingAppts}
`.trim();

  const prompt = `Analyze this business data snapshot and generate exactly 6 actionable insights. Each insight must be specific, data-driven, and immediately actionable.

${dataSnapshot}

Respond with a JSON array of exactly 6 insights in this format:
[
  {
    "title": "Short insight title (max 8 words)",
    "body": "2-3 sentence explanation with specific numbers and a clear recommended action.",
    "priority": "high" | "medium" | "low",
    "category": "revenue" | "expenses" | "growth" | "risk" | "opportunity" | "action"
  }
]

Rules:
- Use the actual numbers from the data
- Be specific and actionable — "Follow up on the 3 overdue invoices" not "check your invoices"
- Prioritize high if there's a risk (overdue invoices, revenue drop, high expenses)
- Return only the JSON array, no other text`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "[]";

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ insights, snapshot: dataSnapshot });
  } catch {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
