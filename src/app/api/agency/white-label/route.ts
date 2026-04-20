import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agency/white-label?workspace=<slug>
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true, isAgency: true,
      wlBrandName: true, wlLogoUrl: true, wlPrimaryColor: true,
      wlSupportEmail: true, wlCustomDomain: true, wlHideAttribution: true,
    },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ whiteLabel: workspace });
}

// PUT /api/agency/white-label
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceSlug, isAgency, wlBrandName, wlLogoUrl, wlPrimaryColor, wlSupportEmail, wlCustomDomain, wlHideAttribution } = await req.json();
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      isAgency: isAgency !== undefined ? !!isAgency : undefined,
      wlBrandName: wlBrandName !== undefined ? wlBrandName || null : undefined,
      wlLogoUrl: wlLogoUrl !== undefined ? wlLogoUrl || null : undefined,
      wlPrimaryColor: wlPrimaryColor !== undefined ? wlPrimaryColor || null : undefined,
      wlSupportEmail: wlSupportEmail !== undefined ? wlSupportEmail || null : undefined,
      wlCustomDomain: wlCustomDomain !== undefined ? wlCustomDomain || null : undefined,
      wlHideAttribution: wlHideAttribution !== undefined ? !!wlHideAttribution : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
