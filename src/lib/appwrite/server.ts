import 'server-only';

import { SESSION_COOKIE_KEY } from '@/features/auth/constants';
import { cookies } from 'next/headers';
import {
  Account,
  Client,
  Storage,
  TablesDB,
  Teams,
  Tokens,
  Users,
} from 'node-appwrite';
import { cache } from 'react';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const session = (await cookies()).get(SESSION_COOKIE_KEY);

  if (!session || !session.value) throw new Error('No session');
  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new TablesDB(client);
    },
    get storage() {
      return new Storage(client);
    },
    get Teams() {
      return new Teams(client);
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
    get tokens() {
      return new Tokens(client);
    },
    get users() {
      return new Users(client);
    },
    get database() {
      return new TablesDB(client);
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
