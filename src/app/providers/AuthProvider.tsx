'use client';

import { signinAction, signoutAction } from '@/actions/auth.action';
import { AuthContext } from '@/contexts/AuthContext';
import { createClientSideClient } from '@/lib/appwrite/client';
import { SignInSchemaType } from '@/utils/schemas';
import { Models } from 'appwrite';
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
  const clientRef = useRef<ReturnType<typeof createClientSideClient> | null>(
    null
  );
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    state: 'pending',
    user: null,
  });

  const updateUser = useCallback(async () => {
    try {
      const user = await clientRef.current?.account.get();
      if (user) dispatch({ type: 'LOGGED_IN', payload: { user } });
    } catch (error) {
      console.log(error);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: 'REFRESHING' });
      await updateUser();
    } catch (error) {
      console.warn('[refresh] -', error);

      dispatch({ type: 'LOGOUT' });
    }
  }, [updateUser]);

  const signIn = async (credentials: SignInSchemaType) => {
    try {
      dispatch({ type: 'LOGGING_IN' });
      const session = await signinAction(credentials);
      clientRef.current?.client.setSession(session.secret);
      await updateUser();
      router.replace('/');
    } catch (error) {
      console.log(error);

      dispatch({ type: 'LOGOUT' });
    }
  };

  const signout = async () => {
    try {
      await signoutAction();
    } catch (error) {
      console.error(error);
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
    <AuthContext.Provider value={{ ...state, signIn, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
