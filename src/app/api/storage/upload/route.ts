import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const workspaceSlug = formData.get("workspaceSlug") as string;

  if (!file || !workspaceSlug) return NextResponse.json({ error: "Missing file or workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If R2 is configured, upload there; otherwise store metadata only
  const key = `${workspace.id}/${randomBytes(8).toString("hex")}-${file.name}`;
  let url = "";

  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET;

  if (r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2Bucket) {
    // R2 upload would go here via AWS S3-compatible API
    url = `https://${r2AccountId}.r2.cloudflarestorage.com/${r2Bucket}/${key}`;
  } else {
    url = `/api/storage/serve/${key}`;
  }

  const storageFile = await prisma.storageFile.create({
    data: {
      workspaceId: workspace.id,
      name: file.name,
      key,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      url,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ file: storageFile }, { status: 201 });
}
