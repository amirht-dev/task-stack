import 'server-only';

import { SESSION_COOKIE_KEY } from '@/constants/auth';
import { cookies } from 'next/headers';
import { Account, Client } from 'node-appwrite';
import { cache } from 'react';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const session = (await cookies()).get(SESSION_COOKIE_KEY);
  if (!session || !session.value) {
    throw new Error('No session');
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.NEXT_APPWRITE_KEY);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export const getLoggedInUser = cache(async () => {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    else console.log(error);
  }
});
