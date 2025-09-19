import 'client-only';
import { type Simplify } from 'type-fest';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  sidebarStoreSlice,
  type SidebarGlobalStoreAction,
  type SidebarGlobalStoreState,
} from './sidebarSlice';
import {
  workspaceStoreSlice,
  type WorkspaceGlobalStoreAction,
  type WorkspaceGlobalStoreState,
} from './workspaceSlice';

export type GlobalStoreState = Simplify<
  SidebarGlobalStoreState & WorkspaceGlobalStoreState
>;

export type GlobalStoreAction = Simplify<
  SidebarGlobalStoreAction & WorkspaceGlobalStoreAction
>;

export type GlobalStoreType = Simplify<GlobalStoreState & GlobalStoreAction>;

export function createGlobalStore(initialState?: GlobalStoreState) {
  return createStore<GlobalStoreType, [['zustand/devtools', never]]>(
    devtools((...args) => ({
      ...initialState,
      ...sidebarStoreSlice(...args),
      ...workspaceStoreSlice(...args),
    }))
  );
}

export type GlobalStoreApi = ReturnType<typeof createGlobalStore>;
