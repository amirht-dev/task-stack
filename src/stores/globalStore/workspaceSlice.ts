import { Workspace } from '@/lib/appwrite/appwrite';
import { Simplify } from 'type-fest';
import { StateCreator } from 'zustand';

export type WorkspaceGlobalStoreState = { workspace: Workspace | null };

export type WorkspaceGlobalStoreAction = {
  setWorkspace: (workspaceId: Workspace | null) => void;
};

export type WorkspaceGlobalStoreType = Simplify<
  WorkspaceGlobalStoreState & WorkspaceGlobalStoreAction
>;

export const workspaceStoreSlice: StateCreator<WorkspaceGlobalStoreType> = (
  set
): WorkspaceGlobalStoreType => ({
  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),
});
