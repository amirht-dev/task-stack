import { Account, Client, Teams } from 'appwrite';

export function createPublicClient() {
  const client = new Client();

  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  return {
    client,
    get account() {
      return new Account(client);
    },
    get teams() {
      return new Teams(client);
    },
  };
}
