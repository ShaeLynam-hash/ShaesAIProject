import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { workspaceSlug, event, properties, userId, sessionId } = await req.json();
  if (!workspaceSlug || !event) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.analyticsEvent.create({
    data: {
      workspaceId: workspace.id,
      event,
      properties: properties ?? null,
      userId: userId ?? null,
      sessionId: sessionId ?? null,
      ip: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
