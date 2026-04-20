import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default chart of accounts to seed for new workspaces
const DEFAULT_ACCOUNTS = [
  // ASSETS
  { code: "1000", name: "Cash",                    type: "ASSET",     subtype: "Current Asset" },
  { code: "1010", name: "Checking Account",         type: "ASSET",     subtype: "Current Asset" },
  { code: "1020", name: "Savings Account",          type: "ASSET",     subtype: "Current Asset" },
  { code: "1100", name: "Accounts Receivable",      type: "ASSET",     subtype: "Current Asset" },
  { code: "1200", name: "Inventory",                type: "ASSET",     subtype: "Current Asset" },
  { code: "1500", name: "Equipment",                type: "ASSET",     subtype: "Fixed Asset"   },
  { code: "1600", name: "Vehicles",                 type: "ASSET",     subtype: "Fixed Asset"   },
  // LIABILITIES
  { code: "2000", name: "Accounts Payable",         type: "LIABILITY", subtype: "Current Liability" },
  { code: "2100", name: "Credit Cards Payable",     type: "LIABILITY", subtype: "Current Liability" },
  { code: "2200", name: "Sales Tax Payable",        type: "LIABILITY", subtype: "Current Liability" },
  { code: "2300", name: "Short-term Loans",         type: "LIABILITY", subtype: "Current Liability" },
  { code: "2700", name: "Long-term Loans",          type: "LIABILITY", subtype: "Long-term Liability" },
  // EQUITY
  { code: "3000", name: "Owner's Equity",           type: "EQUITY",    subtype: "Equity" },
  { code: "3100", name: "Retained Earnings",        type: "EQUITY",    subtype: "Equity" },
  { code: "3200", name: "Owner's Draws",            type: "EQUITY",    subtype: "Equity" },
  // REVENUE
  { code: "4000", name: "Revenue",                  type: "REVENUE",   subtype: "Operating Revenue" },
  { code: "4100", name: "Service Revenue",          type: "REVENUE",   subtype: "Operating Revenue" },
  { code: "4200", name: "Product Sales",            type: "REVENUE",   subtype: "Operating Revenue" },
  { code: "4900", name: "Other Income",             type: "REVENUE",   subtype: "Other Income" },
  // EXPENSES
  { code: "5000", name: "Cost of Goods Sold",       type: "EXPENSE",   subtype: "Cost of Revenue" },
  { code: "5100", name: "Payroll & Salaries",       type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5200", name: "Rent & Utilities",         type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5300", name: "Software & Subscriptions", type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5400", name: "Marketing & Advertising",  type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5500", name: "Travel & Entertainment",   type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5600", name: "Professional Services",    type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5700", name: "Office Supplies",          type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5800", name: "Insurance",                type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5900", name: "Depreciation",             type: "EXPENSE",   subtype: "Operating Expense" },
  { code: "5999", name: "Other Expenses",           type: "EXPENSE",   subtype: "Operating Expense" },
] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auto-seed default accounts if none exist
  const count = await prisma.chartAccount.count({ where: { workspaceId: workspace.id } });
  if (count === 0) {
    await prisma.chartAccount.createMany({
      data: DEFAULT_ACCOUNTS.map((a) => ({
        workspaceId: workspace.id,
        code: a.code,
        name: a.name,
        type: a.type,
        subtype: a.subtype,
        isSystem: true,
      })),
    });
  }

  const accounts = await prisma.chartAccount.findMany({
    where: { workspaceId: workspace.id, active: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, code, name, type, subtype, description } = await req.json();
  if (!workspaceSlug || !code || !name || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const account = await prisma.chartAccount.create({
    data: { workspaceId: workspace.id, code, name, type, subtype: subtype || null, description: description || null },
  });

  return NextResponse.json({ account }, { status: 201 });
}
