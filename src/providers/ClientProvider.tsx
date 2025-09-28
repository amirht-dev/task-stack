'use client';

import { ClientContext } from '@/contexts/ClientContext';
import { setJWTCookieAction } from '@/features/auth/actions';
import { createClientSideClient } from '@/lib/appwrite/client';
import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
import { PropsWithChildren, useCallback, useState } from 'react';

const ClientProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(createClientSideClient);

  const setJWTCookie = useCallback(async () => {
    const { jwt } = await client.account.createJWT();
    await setJWTCookieAction(jwt);
  }, [client]);

  const handleRefreshJWT = useCallback(
    <
      T extends (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ) =>
        | Promise<DiscriminatedResponse>
        | Promise<DiscriminatedResponseWithData<unknown>>
    >(
      fn: T
    ): T => {
      return async function (...args: Parameters<T>) {
        const res = await fn(...args);
        if (!res.success && res.error.type === 'user_jwt_invalid') {
          setJWTCookie();
          return fn(...args);
        }
        return res;
      } as T;
    },
    [setJWTCookie]
  );

  return (
    <ClientContext.Provider value={{ ...client, setJWTCookie }}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientProvider;
