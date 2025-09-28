'use server';

import { JWT_COOKIE_KEY, SESSION_COOKIE_KEY } from '@/features/auth/constants';
import { OAuthSchemaType, SignInSchemaType } from '@/features/auth/schemas';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { handleResponse } from '@/utils/server';
import { cookies, headers } from 'next/headers';
import { ID, OAuthProvider } from 'node-appwrite';
import { setSessionCookie } from './utils/server';

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

export const emailPasswordSigninAction = async ({
  email,
  password,
}: SignInSchemaType) => {
  return handleResponse(async () => {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    await setSessionCookie(session);
  });
};

export const signoutAction = async () => {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: 'current' });
    const cookie = await cookies();
    cookie.delete(SESSION_COOKIE_KEY);
    cookie.delete(JWT_COOKIE_KEY);
  });
};

export const oauthGetURLAction = async (provider: OAuthProvider) => {
  return handleResponse(async () => {
    const { account } = await createAdminClient();
    const origin = (await headers()).get('origin');
    if (!origin) throw new Error('No origin');
    const successURL = new URL('/oauth/callback', origin).toString();
    return await account.createOAuth2Token({
      provider,
      success: successURL,
    });
  });
};

export const oauthSigninAction = async (data: OAuthSchemaType) => {
  return handleResponse(async () => {
    const { account } = await createAdminClient();
    const session = await account.createSession(data);
    await setSessionCookie(session);
  });
};

export const getCurrentUserAction = async () => {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    return await account.get();
  });
};

export const setJWTCookieAction = async (jwt: string) => {
  const cookie = await cookies();
  cookie.set(JWT_COOKIE_KEY, jwt);
};
