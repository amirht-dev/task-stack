'use server';

import { JWT_COOKIE_KEY, SESSION_COOKIE_KEY } from '@/features/auth/constants';
import { OAuthSchemaType, SignInSchemaType } from '@/features/auth/schemas';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { handleResponse } from '@/utils/server';
import { cookies, headers } from 'next/headers';
import { ID, OAuthProvider, Permission, Role } from 'node-appwrite';
import {
  UpdateProfileEmailFormSchema,
  UpdateProfilePasswordFormSchema,
} from '../auth/schemas';
import { DatabaseProfile } from '../auth/types';
import { setSessionCookie } from './utils/server';

export async function createProfileAction(userId: string) {
  return handleResponse(async () => {
    const { database } = await createAdminClient();
    return await database.createRow<DatabaseProfile>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
      rowId: ID.unique(),
      data: {
        userId: userId,
        avatarImageId: null,
      },
      permissions: [
        Permission.write(Role.user(userId)),
        Permission.read(Role.user(userId)),
      ],
    });
  });
}

export async function getProfileAction() {
  const { database } = await createSessionClient();

  const profiles = await database.listRows({
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
  });

  return profiles.rows[0];
}

export const signupAction: ServerFunction<
  [credentials: { email: string; password: string }]
> = async ({ email, password }) => {
  const { account } = await createAdminClient();

  const user = await account.create({
    userId: ID.unique(),
    email,
    password,
  });

  const profileRes = await createProfileAction(user.$id);

  if (!profileRes.success) throw new Error(profileRes.error.message);
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

    const profileRes = await createProfileAction(data.userId);
    if (!profileRes.success) throw new Error(profileRes.error.message);

    await setSessionCookie(session);
  });
};

async function getImageAction(imageId: string) {
  const { storage } = await createSessionClient();

  const [info, arrayBuffer] = await Promise.all([
    storage.getFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    }),
    storage.getFileView({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    }),
  ]);

  const blob = new Blob([arrayBuffer], { type: info.mimeType });

  return { info, image: { blob, arrayBuffer } };
}

export const getCurrentUserAction = async () => {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    const user = await account.get();

    const profile = await getProfileAction();

    let avatarImageBlob: Blob | null = null;

    if (profile.avatarImageId) {
      const {
        image: { blob },
      } = await getImageAction(profile.avatarImageId);

      avatarImageBlob = blob;
    }

    return {
      ...user,
      profile: {
        ...profile,
        avatarImageBlob,
      },
    };
  });
};

export async function updateProfileNameAction(name: string) {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    return await account.updateName({ name });
  });
}

export async function updateProfileEmailAction(
  data: UpdateProfileEmailFormSchema
) {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    return await account.updateEmail(data);
  });
}

export async function updateProfilePasswordAction(
  data: UpdateProfilePasswordFormSchema
) {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    return await account.updatePassword(data);
  });
}

export async function sendEmailVerificationAction() {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    return await account.createVerification({
      url: `${process.env.NEXT_PUBLIC_ORIGIN_URL}/verify-email/callback`,
    });
  });
}

export async function verifyEmailVerificationAction(
  userId: string,
  secret: string
) {
  return handleResponse(async () => {
    const { account } = await createSessionClient();
    account.updateVerification({ userId, secret });
  });
}

export async function updateProfileAvatarAction(file: File) {
  return handleResponse(async () => {
    const { storage, account, database } = await createSessionClient();

    const [user, profile] = await Promise.all([
      account.get(),
      getProfileAction(),
    ]);

    const avatar = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      file,
      fileId: ID.unique(),
      permissions: [
        Permission.write(Role.user(user.$id)),
        Permission.read(Role.user(user.$id)),
      ],
    });

    return await database.updateRow<DatabaseProfile>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
      data: {
        avatarImageId: avatar.$id,
      } satisfies Partial<DatabaseProfile>,
      rowId: profile.$id,
    });
  });
}
