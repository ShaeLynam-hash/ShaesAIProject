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

  const expenses = await prisma.expense.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, description, amount, category, date, vendor, notes } = await req.json();
  if (!workspaceSlug || !description || amount == null || !category || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const expense = await prisma.expense.create({
    data: {
      workspaceId: workspace.id,
      description,
      amount,
      category,
      date: new Date(date),
      vendor: vendor || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
