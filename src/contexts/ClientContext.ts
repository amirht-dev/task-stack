import { createClientSideClient } from '@/lib/appwrite/client';
import { createContext, useContext } from 'react';

export const ClientContext = createContext<
  | (ReturnType<typeof createClientSideClient> & {
      setJWTCookie: () => Promise<void>;
    })
  | null
>(null);

export const useClientContext = () => {
  const ctx = useContext(ClientContext);

  if (!ctx) throw new Error('useClientContext must bet inside ClientProvider');

  return ctx;
};
