import { Workspace } from '@/features/workspaces/types';
import { Simplify } from 'type-fest';
import { StateCreator } from 'zustand';

export type WorkspaceGlobalStoreState = {
  workspace: Workspace | null;
};

export type WorkspaceGlobalStoreAction = {
  setWorkspace: (workspace: Workspace | null) => void;
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
