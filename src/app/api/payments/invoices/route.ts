import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true, lineItems: true },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, customerId, dueDate, taxRate, notes, lineItems } = await req.json();
  if (!workspaceSlug || !dueDate || !lineItems?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate invoice number
  const count = await prisma.invoice.count({ where: { workspaceId: workspace.id } });
  const number = `INV-${String(count + 1).padStart(4, "0")}`;

  const subtotal = lineItems.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * ((taxRate ?? 0) / 100);
  const total = subtotal + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      customerId: customerId ?? null,
      number,
      dueDate: new Date(dueDate),
      taxRate: taxRate ?? 0,
      taxAmount,
      subtotal,
      total,
      notes: notes ?? null,
      lineItems: {
        create: lineItems.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { customer: true, lineItems: true },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
