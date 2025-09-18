'use client';

import { GlobalStoreContext } from '@/contexts/GlobalStoreContext';
import {
  createGlobalStore,
  GlobalStoreApi,
  GlobalStoreState,
} from '@/stores/globalStore';
import { PropsWithChildren, useRef } from 'react';

type GlobalStoreProviderProps = PropsWithChildren<{
  initialState?: GlobalStoreState;
}>;

const GlobalStoreProvider = ({
  children,
  initialState,
}: GlobalStoreProviderProps) => {
  const store = useRef<GlobalStoreApi | null>(null);

  store.current ??= createGlobalStore(initialState);

  return (
    <GlobalStoreContext.Provider value={store.current}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

export default GlobalStoreProvider;
