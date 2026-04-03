import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const workspaceSlug = searchParams.get("workspace");
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const where: Record<string, unknown> = { workspaceId: workspace.id };
  if (status) where.status = status;
  if (upcoming === "true") where.date = { gte: new Date() };

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: "asc" },
    include: { service: true },
    ...(upcoming === "true" ? { take: 5 } : {}),
  });
  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, serviceId, clientName, clientEmail, clientPhone, date, notes } = await req.json();
  if (!workspaceSlug || !serviceId || !clientName || !clientEmail || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const appointment = await prisma.appointment.create({
    data: {
      workspaceId: workspace.id,
      serviceId,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      date: new Date(date),
      notes: notes || null,
    },
    include: { service: true },
  });
  return NextResponse.json({ appointment }, { status: 201 });
}
