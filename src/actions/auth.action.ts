'use server';

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { SignInSchemaType } from '@/utils/schemas';
import { cookies } from 'next/headers';
import { ID, Models } from 'node-appwrite';

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
