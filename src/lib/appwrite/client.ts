import { Account, Client } from 'appwrite';
import 'client-only';

export function createClientSideClient() {
  const client = new Client();

  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  return {
    client,
    get account() {
      return new Account(client);
    },
  };
}
