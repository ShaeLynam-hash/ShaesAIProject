import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ workspaceSlug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { workspaceSlug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const services = await prisma.service.findMany({
    where: { workspaceId: workspace.id, active: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ workspace: { name: workspace.name, slug: workspace.slug }, services });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { workspaceSlug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { serviceId, clientName, clientEmail, clientPhone, date } = await req.json();
  if (!serviceId || !clientName || !clientEmail || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const service = await prisma.service.findFirst({ where: { id: serviceId, workspaceId: workspace.id, active: true } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  const appointment = await prisma.appointment.create({
    data: { workspaceId: workspace.id, serviceId, clientName, clientEmail, clientPhone: clientPhone || null, date: new Date(date) },
  });
  return NextResponse.json({ appointment }, { status: 201 });
}
