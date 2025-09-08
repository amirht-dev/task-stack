import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Account, Client } from 'node-appwrite';
import { cache } from 'react';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const session = (await cookies()).get('session');
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

export const auth = cache(async () => {
  try {
    const { account } = await createSessionClient();

    return await account.get();
  } catch (error) {
    console.error(error);
    redirect('/sign-in');
  }
});
