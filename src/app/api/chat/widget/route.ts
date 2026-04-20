import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — no auth — returns widget config for embedding
export async function GET(req: NextRequest) {
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return NextResponse.json({ error: "Missing workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      chatWidget: {
        select: { id: true, enabled: true, widgetColor: true, welcomeMessage: true, teamName: true, teamAvatar: true, aiEnabled: true },
      },
    },
  });

  if (!workspace?.chatWidget) {
    // Return default config even if not set up yet
    return NextResponse.json({
      widget: { enabled: true, widgetColor: "#F59E0B", welcomeMessage: "Hi! How can we help you today?", teamName: "Support", teamAvatar: null },
    });
  }

  return NextResponse.json({ widget: workspace.chatWidget });
}
