import type { GlobalStoreApi, GlobalStoreType } from '@/stores/globalStore';
import 'client-only';
import { createContext, useContext } from 'react';
import { useStore } from 'zustand';

export const GlobalStoreContext = createContext<GlobalStoreApi | null>(null);

export const useGlobalStore = <T,>(selector: (store: GlobalStoreType) => T) => {
  const ctx = useContext(GlobalStoreContext);

  if (!ctx)
    throw new Error('useGLobalStore must be inside GlobalStoreProvider');

  return useStore(ctx, selector);
};
