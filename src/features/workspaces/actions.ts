'use server';

import { Workspace } from '@/lib/appwrite/appwrite';
import { createSessionClient } from '@/lib/appwrite/server';
import { handleResponse } from '@/utils/server';

export async function getWorkspacesAction() {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    return await database.listRows<Workspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    });
  });
}
