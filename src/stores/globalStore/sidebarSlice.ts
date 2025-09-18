import type { Simplify } from 'type-fest';
import type { StateCreator } from 'zustand';

export type SidebarGlobalStoreState = {
  sidebarState: 'expanded' | 'collapsed';
};

export type SidebarGlobalStoreAction = {
  toggleSidebar: () => void;
};

export type SidebarGlobalStoreType = Simplify<
  SidebarGlobalStoreState & SidebarGlobalStoreAction
>;

export const sidebarStoreSlice: StateCreator<SidebarGlobalStoreType> = (
  set
): SidebarGlobalStoreType => ({
  sidebarState: 'expanded',
  toggleSidebar: () =>
    set((state) => ({
      sidebarState:
        state.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
    })),
});
