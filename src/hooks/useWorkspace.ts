"use client";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace.store";

export function useWorkspace() {
  const params = useParams();
  const slug = params?.workspaceSlug as string | undefined;
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  return { slug, currentWorkspace, setCurrentWorkspace };
}
