'use client';

import {
  emailPasswordSigninAction,
  getCurrentUserAction,
  setJWTCookie,
  signoutAction,
} from '@/features/auth/actions';
import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/features/auth/constants';
import { AuthContext } from '@/features/auth/contexts/AuthContext';
import useAuthState from '@/features/auth/hooks/useAuthState';
import useOAuthPopup from '@/features/auth/hooks/useOAuthPopup';
import { SignInSchemaType } from '@/features/auth/schemas';
import { createClientSideClient } from '@/lib/appwrite/client';
import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const OAUTH_TOAST_ID = 'oauth-toast';

const authToast = {
  loading: () =>
    toast.loading('signing in...', {
      id: OAUTH_TOAST_ID,
      description: undefined,
    }),
  success: () =>
    toast.success('signed in successfully', {
      id: OAUTH_TOAST_ID,
      description: undefined,
    }),
  error: (error?: string) =>
    toast.error('failed to sign in', {
      id: OAUTH_TOAST_ID,
      description: error,
    }),
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(createClientSideClient);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useAuthState();

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
          console.group('refreshing jwt');
          try {
            const { jwt } = await client.account.createJWT();
            console.log('jwt refreshed');
            await setJWTCookie(jwt);
          } catch (error) {
            console.error(error);
          }
          console.groupEnd();
          return fn(...args);
        }
        return res;
      } as T;
    },
    [client]
  );

  const handleRedirect = () => {
    router.replace(searchParams.get(AUTHENTICATED_REDIRECT_PARAM_KEY) ?? '/');
  };

  const oauthSignIn = useOAuthPopup({
    onStart() {
      dispatch({ type: 'SIGNING_IN' });
      authToast.loading();
    },
    async onSuccess() {
      await updateUser();
      authToast.success();
      handleRedirect();
    },
    onError(error) {
      dispatch({ type: 'SIGNOUT' });
      authToast.error(error);
    },
  });

  const updateUser = useCallback(async () => {
    const res = await handleRefreshJWT(getCurrentUserAction)();

    if (res.success)
      dispatch({ type: 'SIGNED_IN', payload: { user: res.data } });
    else dispatch({ type: 'SIGNOUT' });
  }, [dispatch, handleRefreshJWT]);

  const emailPasswordSignIn = async (credentials: SignInSchemaType) => {
    dispatch({ type: 'SIGNING_IN' });
    authToast.loading();
    const res = await emailPasswordSigninAction(credentials);
    if (res.success) {
      await updateUser();
      authToast.success();
      handleRedirect();
    } else {
      dispatch({ type: 'SIGNOUT' });
      authToast.error(res.error.message);
    }
  };

  const signout = async () => {
    const res = await signoutAction();
    if (res.success) {
      dispatch({ type: 'SIGNOUT' });
      toast.success('signed out successfully');
    } else
      toast.error('failed to sign out', { description: res.error.message });
  };

  useEffect(() => {
    updateUser();
  }, [updateUser]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        emailPasswordSignIn,
        oauthSignIn,
        signout,
        updateUser,
        client,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
