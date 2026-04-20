import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, model, messages } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: "Missing messages" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ content: "Anthropic API key not configured." });

  // Fetch live business context
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ content: "Workspace not found." });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    contactCount,
    leadCount,
    clientCount,
    revenue30d,
    outstandingInvoices,
    upcomingAppts,
    activeDeals,
    expenses30d,
    recentContacts,
    recentInvoices,
  ] = await Promise.all([
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    prisma.contact.count({ where: { workspaceId: workspace.id, status: "LEAD" } }),
    prisma.contact.count({ where: { workspaceId: workspace.id, status: "CLIENT" } }),
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: "PAID", paidAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId: workspace.id, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.appointment.count({
      where: { workspaceId: workspace.id, date: { gte: now, lte: sevenDaysOut }, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.deal.aggregate({
      where: { workspaceId: workspace.id, stage: { notIn: ["WON", "LOST"] } },
      _sum: { value: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { workspaceId: workspace.id, date: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.contact.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { firstName: true, lastName: true, email: true, status: true, company: true },
    }),
    prisma.invoice.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const rev = revenue30d._sum.total ?? 0;
  const exp = expenses30d._sum.amount ?? 0;

  const systemPrompt = `You are an intelligent AI business assistant for ${workspace.name}${workspace.industry ? ` (${workspace.industry})` : ""}. You have live access to their business data as of ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

## Live Business Data

### CRM & Contacts
- Total contacts: ${contactCount}
- Leads: ${leadCount}
- Clients: ${clientCount}
- Recent contacts: ${recentContacts.map((c) => `${c.firstName} ${c.lastName ?? ""}${c.company ? ` (${c.company})` : ""} — ${c.status}`).join(", ") || "none"}

### Revenue & Finance (Last 30 Days)
- Revenue collected: $${rev.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Expenses logged: $${exp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Net profit (30d): $${(rev - exp).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Outstanding invoices: ${outstandingInvoices._count} worth $${(outstandingInvoices._sum.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Recent invoices: ${recentInvoices.map((i) => `#${i.number} ${i.customer?.name ?? "no customer"} $${i.total} (${i.status})`).join(", ") || "none"}

### Pipeline & Sales
- Active deals: ${activeDeals._count} worth $${(activeDeals._sum.value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

### Calendar
- Upcoming appointments (next 7 days): ${upcomingAppts}

## Your Role
You are a knowledgeable, concise, and proactive business advisor. Use this live data to:
- Answer questions about the business accurately
- Spot trends and flag issues (e.g., low revenue, unpaid invoices)
- Suggest action items and next steps
- Help draft emails, proposals, and business content
- Provide strategic advice tailored to the business data

Be direct, actionable, and friendly. Use "$" for amounts and format numbers with commas. If asked about something not in the data, say so honestly.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await res.json();
    const content = data.content?.[0]?.text ?? "No response received.";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "AI service unavailable. Please try again." });
  }
}
