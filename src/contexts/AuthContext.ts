import { AuthState } from '@/app/providers/AuthProvider';
import { SignInSchemaType } from '@/utils/schemas';
import { OAuthProvider } from 'appwrite';
import { createContext, useContext } from 'react';

export type AuthContextType = AuthState & {
  signIn: (credentials: SignInSchemaType) => Promise<void>;
  signout: () => Promise<void>;
  oauthSignIn: (provider: OAuthProvider) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);

  if (!ctx)
    throw new Error('useAuthContext must met called inside AuthProvider');

  return ctx;
};
