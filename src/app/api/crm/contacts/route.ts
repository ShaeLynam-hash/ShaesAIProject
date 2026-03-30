import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug! } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const contacts = await prisma.contact.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceSlug, firstName, lastName, email, phone, company, title, status, source } = await req.json();
  if (!workspaceSlug || !firstName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const contact = await prisma.contact.create({
    data: { workspaceId: workspace.id, firstName, lastName: lastName || null, email: email || null, phone: phone || null, company: company || null, title: title || null, status: status ?? "LEAD", source: source || null },
  });
  return NextResponse.json({ contact }, { status: 201 });
}
