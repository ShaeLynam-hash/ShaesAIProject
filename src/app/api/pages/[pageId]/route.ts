import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ pageId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pageId } = await params;
  const page = await prisma.landingPage.findUnique({ where: { id: pageId } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pageId } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.published !== undefined) data.published = !!body.published;
  if (body.blocks !== undefined) data.blocks = body.blocks;
  if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null;
  if (body.seoDesc !== undefined) data.seoDesc = body.seoDesc || null;
  if (body.customCss !== undefined) data.customCss = body.customCss || null;

  const page = await prisma.landingPage.update({ where: { id: pageId }, data });
  return NextResponse.json({ page });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pageId } = await params;
  await prisma.landingPage.delete({ where: { id: pageId } });
  return NextResponse.json({ ok: true });
}
