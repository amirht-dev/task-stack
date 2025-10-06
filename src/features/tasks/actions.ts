'use server';

import { createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { ID, Permission, Role } from 'node-appwrite';
import { getWorkspaceAction } from '../workspaces/actions';
import { CreateTaskFormSchema } from './schemas';
import { DatabaseTask } from './types';

export async function createTaskAction(data: CreateTaskFormSchema) {
  return handleResponse(async () => {
    const { database, account } = await createSessionClient();
    const user = await account.get();

    const workspace = unwrapDiscriminatedResponse(
      await getWorkspaceAction(data.workspaceId)
    );

    return await database.createRow<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: ID.unique(),
      data: {
        ...data,
        assigneeId: user.$id,
        order: data.order ?? 1,
      },
      permissions: [
        Permission.write(Role.user(user.$id)),
        Permission.read(Role.user(user.$id)),
        Permission.write(Role.user(workspace.userId)),
        Permission.read(Role.user(workspace.userId)),
        Permission.read(Role.team(workspace.teamId)),
      ],
    });
  });
}
