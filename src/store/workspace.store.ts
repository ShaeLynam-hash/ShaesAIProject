import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@prisma/client";

interface WorkspaceStore {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      clearWorkspace: () => set({ currentWorkspace: null }),
    }),
    { name: "workspace-store" }
  )
);
