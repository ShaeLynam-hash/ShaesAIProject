import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ pageId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { pageId } = await params;
  const body = await req.json().catch(() => null);
  const formData = body ?? Object.fromEntries(await req.formData().catch(() => new FormData()));

  const { name, email, phone } = formData as Record<string, string>;

  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
    select: { id: true, workspaceId: true, published: true, leadCount: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const workspaceId = page.workspaceId;
  const firstName = (name ?? "").split(" ")[0] || "Unknown";
  const lastName = (name ?? "").split(" ").slice(1).join(" ") || null;

  // Upsert contact
  if (email) {
    const existing = await prisma.contact.findFirst({ where: { workspaceId, email } });
    if (existing) {
      await prisma.contact.update({ where: { id: existing.id }, data: { phone: phone || existing.phone || null } });
    } else {
      await prisma.contact.create({ data: { workspaceId, firstName, lastName, email, phone: phone || null, status: "LEAD" } });
    }
  }

  await prisma.landingPage.update({ where: { id: pageId }, data: { leadCount: { increment: 1 } } });

  return NextResponse.json({ ok: true });
}
