import { WorkspaceWithImageUrl } from '@/features/workspaces/types';
import { Simplify } from 'type-fest';
import { StateCreator } from 'zustand';

export type WorkspaceGlobalStoreState = {
  workspace: WorkspaceWithImageUrl | null;
};

export type WorkspaceGlobalStoreAction = {
  setWorkspace: (workspace: WorkspaceWithImageUrl | null) => void;
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
