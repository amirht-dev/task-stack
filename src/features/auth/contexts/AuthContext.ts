import { AuthState } from '@/features/auth/hooks/useAuthState';
import { SignInSchemaType } from '@/features/auth/schemas';
import { createClientSideClient } from '@/lib/appwrite/client';
import { OAuthProvider } from 'appwrite';
import { createContext, useContext } from 'react';

export type AuthContextType = AuthState & {
  emailPasswordSignIn: (credentials: SignInSchemaType) => Promise<void>;
  signout: () => Promise<void>;
  oauthSignIn: (provider: OAuthProvider) => Promise<void>;
  updateUser: () => Promise<void>;
  client: ReturnType<typeof createClientSideClient>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);

  if (!ctx)
    throw new Error('useAuthContext must met called inside AuthProvider');

  return ctx;
};
