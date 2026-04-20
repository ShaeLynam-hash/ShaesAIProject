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

  const entries = await prisma.journalEntry.findMany({
    where: { workspaceId: workspace.id },
    include: {
      lines: {
        include: { account: { select: { code: true, name: true, type: true } } },
        orderBy: { debit: "desc" },
      },
    },
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, date, memo, reference, lines } = await req.json();
  if (!workspaceSlug || !date || !lines?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate: debits must equal credits
  const totalDebit = lines.reduce((s: number, l: { debit?: number }) => s + (l.debit ?? 0), 0);
  const totalCredit = lines.reduce((s: number, l: { credit?: number }) => s + (l.credit ?? 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: "Debits must equal credits" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entry = await prisma.journalEntry.create({
    data: {
      workspaceId: workspace.id,
      date: new Date(date),
      memo: memo || null,
      reference: reference || null,
      sourceType: "manual",
      lines: {
        create: lines.map((l: { accountId: string; debit?: number; credit?: number; memo?: string }) => ({
          accountId: l.accountId,
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
          memo: l.memo || null,
        })),
      },
    },
    include: {
      lines: { include: { account: { select: { code: true, name: true } } } },
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
