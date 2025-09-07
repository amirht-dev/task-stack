'use server';

import { createAdminClient } from '@/lib/appwrite/server';
import { ServerFunction } from '@/types/next';
import { ID } from 'node-appwrite';

export const signupAction: ServerFunction<
  [credentials: { email: string; password: string }]
> = async ({ email, password }) => {
  const { account } = await createAdminClient();

  const user = await account.create({
    userId: ID.unique(),
    email,
    password,
  });

  console.log(user);
};
