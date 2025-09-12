'use server';

import { SESSION_COOKIE_KEY } from '@/constants/auth';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { OAuthSchemaType, SignInSchemaType } from '@/utils/schemas';
import { handleResponse, setSessionCookie } from '@/utils/server';
import { cookies } from 'next/headers';
import { ID, OAuthProvider } from 'node-appwrite';

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
    (await cookies()).delete(SESSION_COOKIE_KEY);
  });
};

export const oauthGetURLAction = async (provider: OAuthProvider) => {
  return handleResponse(async () => {
    const { account } = await createAdminClient();
    const successURL = new URL(
      '/oauth/callback',
      process.env.NEXT_PUBLIC_ORIGIN_URL
    );
    return await account.createOAuth2Token({
      provider,
      success: successURL.toString(),
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
