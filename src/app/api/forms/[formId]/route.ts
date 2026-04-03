import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ formId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { formId } = await params;
  const form = await prisma.formBuilder.findUnique({ where: { id: formId } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ form });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { formId } = await params;
  await prisma.formBuilder.delete({ where: { id: formId } });
  return NextResponse.json({ ok: true });
}
