'use server';

import { SESSION_COOKIE_KEY } from '@/constants/auth';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
import { OAuthSchemaType, SignInSchemaType } from '@/utils/schemas';
import { setSessionCookie } from '@/utils/server';
import { cookies } from 'next/headers';
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

  setSessionCookie(session);

  return session;
};

export const signoutAction: ServerFunction<
  [],
  DiscriminatedResponse
> = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: 'current' });
    (await cookies()).delete(SESSION_COOKIE_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'failed to signout',
    };
  }
};

export const oauthGetURLAction: ServerFunction<
  [provider: OAuthProvider, options?: { redirectTo?: string | false }],
  string
> = async (provider) => {
  const { account } = await createAdminClient();

  const successURL = new URL(
    '/oauth/callback',
    process.env.NEXT_PUBLIC_ORIGIN_URL
  );

  const url = await account.createOAuth2Token({
    provider,
    success: successURL.toString(),
  });

  return url;
};

export const oauthSigninAction: ServerFunction<
  [data: OAuthSchemaType],
  { success: true } | { success: false; error: string }
> = async (data) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(data);

    await setSessionCookie(session);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'failed to signin with oauth',
    };
  }
};

export const getCurrentUserAction: ServerFunction<
  [],
  DiscriminatedResponseWithData<Models.User<Models.Preferences>>
> = async () => {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'failed to get current user',
    };
  }
};
