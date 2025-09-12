'use client';

import {
  emailPasswordSigninAction,
  getCurrentUserAction,
  signoutAction,
} from '@/actions/auth.action';
import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/constants/auth';
import { AuthContext } from '@/contexts/AuthContext';
import useOAuthPopup from '@/hooks/useOAuthPopup';
import { createClientSideClient } from '@/lib/appwrite/client';
import { SignInSchemaType } from '@/utils/schemas';
import { Models } from 'appwrite';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PropsWithChildren,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { toast } from 'sonner';

const OAUTH_TOAST_ID = 'oauth-toast';

export type AuthState = {
  user: Models.User<Models.Preferences> | null;
  state: 'authenticated' | 'pending' | 'unauthenticated';
};

export type AuthAction =
  | {
      type: 'SIGNING_IN' | 'SIGNOUT' | 'REFRESHING';
    }
  | {
      type: 'SIGNED_IN';
      payload: { user: Models.User<Models.Preferences> };
    };

const reducer: Reducer<AuthState, AuthAction> = (state, action) => {
  switch (action.type) {
    case 'SIGNING_IN':
      return {
        state: 'pending',
        user: null,
      };
    case 'SIGNED_IN':
      return {
        state: 'authenticated',
        user: action.payload.user,
      };
    case 'SIGNOUT':
      return {
        state: 'unauthenticated',
        user: null,
      };
    case 'REFRESHING':
      return {
        state: 'pending',
        user: state.user,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  const clientRef = useRef<ReturnType<typeof createClientSideClient> | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(reducer, {
    state: 'pending',
    user: null,
  });

  const oauthSignIn = useOAuthPopup({
    onStart() {
      dispatch({ type: 'SIGNING_IN' });
      toast.loading('signing in...', { id: OAUTH_TOAST_ID });
    },
    async onSuccess() {
      toast.success('logged in successfully', { id: OAUTH_TOAST_ID });
      await updateUser();
      const redirectURL = searchParams.get(AUTHENTICATED_REDIRECT_PARAM_KEY);
      if (redirectURL) router.replace(redirectURL);
    },
    onFailed() {
      toast.error('failed to login', { id: OAUTH_TOAST_ID });
      dispatch({ type: 'SIGNOUT' });
    },
  });

  const updateUser = useCallback(async () => {
    const res = await getCurrentUserAction();

    if (res.success)
      dispatch({ type: 'SIGNED_IN', payload: { user: res.data } });
    else dispatch({ type: 'SIGNOUT' });
  }, []);

  const emailPasswordSignIn = async (credentials: SignInSchemaType) => {
    dispatch({ type: 'SIGNING_IN' });
    toast.loading('signing in...', { id: OAUTH_TOAST_ID });
    const res = await emailPasswordSigninAction(credentials);
    if (res.success) {
      await updateUser();
      toast.success('signed in successfully', { id: OAUTH_TOAST_ID });
      const redirectURL = searchParams.get(AUTHENTICATED_REDIRECT_PARAM_KEY);
      if (redirectURL) router.replace(redirectURL);
    } else {
      dispatch({ type: 'SIGNOUT' });
      toast.error(`failed to sign in. ${res.error}`, { id: OAUTH_TOAST_ID });
    }
  };

  const signout = async () => {
    const res = await signoutAction();

    if (res.success) {
      dispatch({ type: 'SIGNOUT' });
      toast.success('signed out successfully');
    } else toast.error(res.error);
  };

  useEffect(() => {
    clientRef.current ??= createClientSideClient();
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
