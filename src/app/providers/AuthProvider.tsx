'use client';

import { signinAction } from '@/actions/auth.action';
import { AuthContext } from '@/contexts/AuthContext';
import { createClientSideClient } from '@/lib/appwrite/client';
import { SignInSchemaType } from '@/utils/schemas';
import { Account, Models } from 'appwrite';
import { useRouter } from 'next/navigation';
import {
  PropsWithChildren,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

export type AuthState = {
  user: Models.User<Models.Preferences> | null;
  state: 'authenticated' | 'pending' | 'unauthenticated';
};

export type AuthAction =
  | {
      type: 'LOGGING_IN' | 'LOGOUT' | 'REFRESHING';
    }
  | {
      type: 'LOGGED_IN';
      payload: { user: Models.User<Models.Preferences> };
    };

const reducer: Reducer<AuthState, AuthAction> = (state, action) => {
  switch (action.type) {
    case 'LOGGING_IN':
      return {
        state: 'pending',
        user: null,
      };
    case 'LOGGED_IN':
      return {
        state: 'authenticated',
        user: action.payload.user,
      };
    case 'LOGOUT':
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
  const clientRef = useRef<{ account: Account } | null>(null);
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    state: 'pending',
    user: null,
  });

  const updateUser = useCallback(async () => {
    const user = await clientRef.current?.account.get();
    if (user) dispatch({ type: 'LOGGED_IN', payload: { user } });
  }, []);

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: 'REFRESHING' });
      updateUser();
    } catch (error) {
      console.error(error);

      dispatch({ type: 'LOGOUT' });
    }
  }, [updateUser]);

  const signIn = async (credentials: SignInSchemaType) => {
    try {
      dispatch({ type: 'LOGGING_IN' });
      await signinAction(credentials);
      await updateUser();
      router.push('/');
    } catch (error) {
      console.error(error);

      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    clientRef.current = createClientSideClient();
  }, []);

  useEffect(() => {
    refresh();

    const listener = (e: CookieChangeEvent) => {
      if (e.deleted.some((cookie) => cookie.name === 'session'))
        dispatch({ type: 'LOGOUT' });
    };

    window.cookieStore.addEventListener('change', listener);

    return () => {
      window.cookieStore.removeEventListener('change', listener);
    };
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ ...state, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
