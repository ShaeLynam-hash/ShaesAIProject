import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pages = await prisma.landingPage.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true, slug: true, published: true, viewCount: true, leadCount: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, name } = await req.json();
  if (!workspaceSlug || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug }, select: { id: true } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate slug from name
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  if (!slug) slug = "page";
  const existing = await prisma.landingPage.findUnique({ where: { workspaceId_slug: { workspaceId: workspace.id, slug } } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const page = await prisma.landingPage.create({
    data: {
      workspaceId: workspace.id,
      name,
      slug,
      blocks: [
        { id: "b1", type: "hero", data: { headline: name, subheadline: "The best solution for your needs.", ctaText: "Get Started", ctaUrl: "#", bgColor: "#1a1a2e" } },
        { id: "b2", type: "features", data: { heading: "Why Choose Us", items: [{ icon: "⚡", title: "Fast", desc: "Lightning fast performance" }, { icon: "🔒", title: "Secure", desc: "Enterprise-grade security" }, { icon: "📊", title: "Analytics", desc: "Deep insights into your data" }] } },
        { id: "b3", type: "cta", data: { headline: "Ready to get started?", ctaText: "Start Free Trial", ctaUrl: "#", bgColor: "#6366F1" } },
      ],
    },
  });

  return NextResponse.json({ page }, { status: 201 });
}
