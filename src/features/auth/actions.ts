'use server';

import { getImageAction } from '@/actions';
import { JWT_COOKIE_KEY, SESSION_COOKIE_KEY } from '@/features/auth/constants';
import { OAuthSchemaType, SignInSchemaType } from '@/features/auth/schemas';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { cookies, headers } from 'next/headers';
import { ID, OAuthProvider } from 'node-appwrite';
import {
  createProfileAction,
  deleteProfileAsAdminAction,
  getProfileAction,
} from '../profile/actions';
import { setSessionCookie } from './utils/server';

export async function signupAction({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return handleResponse(async () => {
    const { account, users } = await createAdminClient();

    const transaction = new Transaction();

    const user = await transaction.operation({
      name: 'create user',
      fn: () =>
        account.create({
          userId: ID.unique(),
          email,
          password,
        }),
      rollbackFn: (user) => users.delete({ userId: user.$id }),
    })();

    await transaction.operation({
      name: 'create user profile',
      fn: async () => {
        if (!user) throw new Error('No user');

        return unwrapDiscriminatedResponse(await createProfileAction(user.$id));
      },
      rollbackFn: async (profile) => deleteProfileAsAdminAction(profile.$id),
    })();

    transaction.handleThrowError();
  });
}

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

    const token = await account.createOAuth2Token({
      provider,
      success: successURL,
    });

    return token;
  });
};

export const oauthSigninAction = async (data: OAuthSchemaType) => {
  return handleResponse(async () => {
    const { account, users } = await createAdminClient();

    const transaction = new Transaction();

    const session = await transaction.operation({
      name: 'create session',
      fn: () => account.createSession(data),
      rollbackFn: (session) =>
        users.deleteSession({ userId: session.userId, sessionId: session.$id }),
    })();

    await transaction.operation({
      name: 'create user profile',
      fn: async () =>
        unwrapDiscriminatedResponse(await createProfileAction(data.userId)),
      rollbackFn: (profile) => deleteProfileAsAdminAction(profile.$id),
    })();

    transaction.handleThrowError();

    if (session) await setSessionCookie(session);
  });
};

export const getCurrentUserAction = async () => {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    const user = await account.get();

    const profile = unwrapDiscriminatedResponse(await getProfileAction());

    const avatarImageBlob = profile.avatarImageId
      ? (await getImageAction(profile.avatarImageId)).image.blob
      : null;

    return {
      ...user,
      profile: {
        ...profile,
        avatarImageBlob,
      },
    };
  });
};
