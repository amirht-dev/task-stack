import { parseCookies } from '@/utils/client';
import { Account, Client } from 'appwrite';
import 'client-only';

export function createClientSideClient() {
  const client = new Client();

  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const session = parseCookies()?.session;

  if (session) client.setSession(session);

  return {
    get account() {
      return new Account(client);
    },
  };
}
