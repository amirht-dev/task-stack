'use server';

import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/constants/auth';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { SignInSchemaType } from '@/utils/schemas';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ID, Models, OAuthProvider } from 'node-appwrite';

export const signupAction: ServerFunction<
  [credentials: { email: string; password: string }]
> = async ({ email, password }) => {
  const { account } = await createAdminClient();

  await account.create({
    userId: ID.unique(),
    email,
    password,
  });
};

export const signinAction: ServerFunction<
  [credentials: SignInSchemaType],
  Models.Session
> = async ({ email, password }) => {
  const { account } = await createAdminClient();

  const session = await account.createEmailPasswordSession({ email, password });

  (await cookies()).set('session', session.secret, {
    expires: new Date(session.expire),
    sameSite: 'strict',
  });

  return session;
};

export const signoutAction: ServerFunction<[]> = async () => {
  const { account } = await createSessionClient();

  await account.deleteSession({ sessionId: 'current' });

  (await cookies()).delete('session');
};

export const OAuthSignin: ServerFunction<
  [provider: OAuthProvider, options?: { redirectTo?: string | false }]
> = async (
  provider,
  { redirectTo = process.env.NEXT_PUBLIC_ORIGIN_URL } = {}
) => {
  const { account } = await createAdminClient();

  const successURL = new URL('/api/oauth', process.env.NEXT_PUBLIC_ORIGIN_URL);

  if (redirectTo)
    successURL.searchParams.set(AUTHENTICATED_REDIRECT_PARAM_KEY, redirectTo);

  const url = await account.createOAuth2Token({
    provider,
    success: successURL.toString(),
  });

  redirect(url);
};
