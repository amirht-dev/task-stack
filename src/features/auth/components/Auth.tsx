'use client';

import { PropsWithChildren } from 'react';
import useAuth from '../hooks/useAuth';

export const SignIn = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return children;
};

export const SignOut = ({ children }: PropsWithChildren) => {
  const { isUnauthenticated } = useAuth();

  if (isUnauthenticated) return children;
};
export const SigningIn = ({ children }: PropsWithChildren) => {
  const { isAuthenticating } = useAuth();

  if (isAuthenticating) return children;
};
