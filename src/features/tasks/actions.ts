'use server';

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { ID, Permission, Query, Role } from 'node-appwrite';
import { getUserAsAdmin } from '../auth/actions';
import { getProjectAction } from '../projects/actions';
import { getWorkspaceAction } from '../workspaces/actions';
import { CreateTaskFormSchema, UpdateTaskFormSchema } from './schemas';
import { DatabaseTask } from './types';

export async function createTaskAction(data: CreateTaskFormSchema) {
  return handleResponse(async () => {
    const { database, account } = await createSessionClient();
    const admin = await createAdminClient();
    const user = await account.get();

    const workspace = unwrapDiscriminatedResponse(
      await getWorkspaceAction(data.workspaceId)
    );

    const task = await database.createRow<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: ID.unique(),
      data: {
        ...data,
        assigneeId: user.$id,
        order: data.order ?? 1,
      },
    });

    await admin.database.updateRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: task.$id,
      permissions: [
        Permission.write(Role.user(user.$id)),
        Permission.read(Role.user(user.$id)),
        Permission.write(Role.user(workspace.userId)),
        Permission.read(Role.user(workspace.userId)),
        Permission.read(Role.team(workspace.teamId)),
      ],
    });

    return task;
  });
}

export async function getTasksAction(projectId: string) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const tasksList = await database.listRows<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      queries: [Query.equal('projectId', projectId)],
    });

    const populatedTasks = await Promise.all(
      tasksList.rows.map(async (task) => {
        const [projectRes, workspaceRes, assignee] = await Promise.all([
          getProjectAction(task.projectId),
          getWorkspaceAction(task.workspaceId),
          getUserAsAdmin(task.assigneeId),
        ]);

        const project = unwrapDiscriminatedResponse(projectRes);
        const workspace = unwrapDiscriminatedResponse(workspaceRes);

        return {
          ...task,
          workspace,
          project,
          assignee: {
            id: assignee.$id,
            name: assignee.name,
            avatar: assignee.profile.avatar,
          },
        };
      })
    );

    return populatedTasks;
  });
}

export async function deleteTaskAction(taskId: string) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const task = await database.getRow<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: taskId,
    });

    await database.deleteRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: task.$id,
    });

    return task;
  });
}

export async function deleteTasksAction(taskIds: string[]) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const tasks = await database.listRows<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      queries: [Query.contains('$id', taskIds)],
    });

    await Promise.all(
      tasks.rows.map(async (task) =>
        unwrapDiscriminatedResponse(await deleteTaskAction(task.$id))
      )
    );

    return tasks.rows;
  });
}

export async function updateTaskAction(
  taskId: string,
  changes: UpdateTaskFormSchema
) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    return await database.updateRow<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      rowId: taskId,
      data: changes,
    });
  });
}
