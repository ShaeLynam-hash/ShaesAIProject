// Cached data fetchers — React cache() deduplicates calls within a single request,
// so layout + page both calling these never hits the DB twice.
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getSession = cache(async () => {
  return auth();
});

export const getWorkspaceBySlug = cache(async (slug: string, userId: string) => {
  return prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId } } },
  });
});
