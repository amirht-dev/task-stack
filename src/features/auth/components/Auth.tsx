'use client';

import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { PropsWithChildren } from 'react';

export const SignIn = ({ children }: PropsWithChildren) => {
  const { state } = useAuthContext();

  if (state === 'authenticated') return children;
};

export const SignOut = ({ children }: PropsWithChildren) => {
  const { state } = useAuthContext();

  if (state === 'unauthenticated') return children;
};
export const SigningIn = ({ children }: PropsWithChildren) => {
  const { state } = useAuthContext();

  if (state === 'pending') return children;
};
