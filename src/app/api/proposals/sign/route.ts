import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/proposals/sign — public endpoint (no auth required), identified by token
export async function POST(req: NextRequest) {
  const { token, signedBy, signatureData, action } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const proposal = await prisma.proposal.findUnique({ where: { publicToken: token } });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (proposal.status === "SIGNED") return NextResponse.json({ error: "Already signed" }, { status: 400 });

  const now = new Date();

  if (action === "decline") {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "DECLINED", declinedAt: now, declineReason: signedBy || null },
    });
    return NextResponse.json({ ok: true, status: "DECLINED" });
  }

  if (!signedBy || !signatureData) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "SIGNED", signedAt: now, signedBy, signatureData },
  });

  return NextResponse.json({ ok: true, status: "SIGNED" });
}

// GET /api/proposals/sign?token=<token> — fetch proposal by public token (no auth)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: {
      workspace: { select: { name: true, logoUrl: true, wlBrandName: true, wlLogoUrl: true, wlPrimaryColor: true } },
      contact: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark as viewed if first time
  if (!proposal.viewedAt) {
    await prisma.proposal.update({ where: { id: proposal.id }, data: { viewedAt: new Date(), status: proposal.status === "SENT" ? "VIEWED" : proposal.status } });
  }

  return NextResponse.json({ proposal });
}
