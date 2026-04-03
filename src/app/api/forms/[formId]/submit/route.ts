import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ formId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { formId } = await params;
  const form = await prisma.formBuilder.findUnique({ where: { id: formId, active: true } });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
  const data = await req.json();
  const submission = await prisma.formSubmission.create({ data: { formId, data } });
  return NextResponse.json({ submission }, { status: 201 });
}
