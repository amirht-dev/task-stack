'use server';

import { getImageAction } from '@/actions';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { ID, Permission, Role } from 'node-appwrite';
import {
  UpdateProfileEmailFormSchema,
  UpdateProfilePasswordFormSchema,
} from '../auth/schemas';
import { DatabaseProfile } from '../auth/types';

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
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const profiles = await database.listRows<DatabaseProfile>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
    });

    return profiles.rows[0];
  });
}

export async function deleteProfileAction() {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const profile = unwrapDiscriminatedResponse(await getProfileAction());

    await database.deleteRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
      rowId: profile.$id,
    });
  });
}

export async function deleteProfileAsAdminAction(
  profileId: DatabaseProfile['$id']
) {
  return handleResponse(async () => {
    const { database } = await createAdminClient();

    await database.deleteRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
      rowId: profileId,
    });
  });
}

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

    const [user, profileRes] = await Promise.all([
      account.get(),
      getProfileAction(),
    ]);

    const profile = unwrapDiscriminatedResponse(profileRes);

    const transaction = new Transaction();

    const { avatarImageId } = unwrapDiscriminatedResponse(
      await getProfileAction()
    );

    const currentAvatar = avatarImageId
      ? await getImageAction(avatarImageId)
      : null;

    const newAvatar = await transaction.operation({
      name: 'upload file',
      fn: () =>
        storage.createFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          file,
          fileId: ID.unique(),
          permissions: [
            Permission.write(Role.user(user.$id)),
            Permission.read(Role.user(user.$id)),
          ],
        }),
      rollbackFn: (file) =>
        storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: file.$id,
        }),
    })();

    if (newAvatar)
      await transaction.operation({
        name: 'update profile',
        fn: async () => {
          return await database.updateRow<DatabaseProfile>({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
            data: {
              avatarImageId: newAvatar.$id,
            } satisfies Partial<DatabaseProfile>,
            rowId: profile.$id,
          });
        },
        rollbackFn: (profile) =>
          database.updateRow({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
            rowId: profile.$id,
            data: {
              avatarImageId: currentAvatar?.info.$id ?? null,
            } satisfies Partial<DatabaseProfile>,
          }),
      })();

    if (currentAvatar) {
      await transaction.operation({
        name: 'delete old avatar',
        fn: async () => {
          await storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: currentAvatar.info.$id,
          });
        },
        rollbackFn: () => {
          storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            file: new File(
              [currentAvatar.image.blob],
              currentAvatar.info.name,
              { type: currentAvatar.info.mimeType }
            ),
            fileId: currentAvatar.info.$id,
            permissions: currentAvatar.info.$permissions,
          });
        },
      })();

      transaction.handleThrowError();
    }
  });
}
