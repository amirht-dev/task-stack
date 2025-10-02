import { Workspaces } from '@/features/workspaces/types';
import { ArrayValues, Simplify } from 'type-fest';
import { StateCreator } from 'zustand';

export type WorkspaceGlobalStoreState = {
  workspace: ArrayValues<Workspaces['rows']> | null;
};

export type WorkspaceGlobalStoreAction = {
  setWorkspace: (workspace: ArrayValues<Workspaces['rows']> | null) => void;
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
