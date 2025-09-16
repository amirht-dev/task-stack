'use client';

import {
  emailPasswordSigninAction,
  getCurrentUserAction,
  signoutAction,
} from '@/features/auth/actions';
import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/features/auth/constants';
import { AuthContext } from '@/features/auth/contexts/AuthContext';
import useAuthState from '@/features/auth/hooks/useAuthState';
import useOAuthPopup from '@/features/auth/hooks/useOAuthPopup';
import { SignInSchemaType } from '@/features/auth/schemas';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect } from 'react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useAuthState();

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
    const res = await getCurrentUserAction();

    if (res.success)
      dispatch({ type: 'SIGNED_IN', payload: { user: res.data } });
    else dispatch({ type: 'SIGNOUT' });
  }, [dispatch]);

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
      authToast.error(res.error);
    }
  };

  const signout = async () => {
    const res = await signoutAction();
    if (res.success) {
      dispatch({ type: 'SIGNOUT' });
      toast.success('signed out successfully');
    } else toast.error('failed to sign out', { description: res.error });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
