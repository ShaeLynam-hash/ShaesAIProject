import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, apiKey, locationId } = await req.json();
  if (!workspaceSlug || !apiKey) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug, members: { some: { userId: session.user.id } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate API key
  try {
    const test = await fetch("https://rest.gohighlevel.com/v1/contacts/?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!test.ok) return NextResponse.json({ error: "Invalid GoHighLevel API key" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not reach GoHighLevel API" }, { status: 400 });
  }

  await prisma.workspaceIntegration.upsert({
    where: { workspaceId_provider: { workspaceId: workspace.id, provider: "gohighlevel" } },
    create: { workspaceId: workspace.id, provider: "gohighlevel", apiKey, config: { locationId }, status: "active" },
    update: { apiKey, config: { locationId }, status: "active", errorMsg: null },
  });

  return NextResponse.json({ success: true });
}
