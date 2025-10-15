'use server';

import { getImageAction } from '@/actions';
import {
  DatabaseWorkspace,
  ResponseWorkspace,
  ResponseWorkspaces,
} from '@/features/workspaces/types';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { getMonthInterval } from '@/lib/utils';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { isBefore, isWithinInterval, subMonths } from 'date-fns';
import { ID, Permission, Query, Role } from 'node-appwrite';
import { ArrayValues } from 'type-fest';
import { getMembersAction } from '../members/actions';
import { deleteProjectsAction, getProjectsAction } from '../projects/actions';
import { DatabaseTask, TaskStatus } from '../tasks/types';
import {
  WorkspaceImageFormUpdateSchema,
  WorkspaceNameFormUpdateSchema,
  WorkspaceSchema,
} from './schemas';

export async function getWorkspacesAction() {
  return handleResponse(async () => {
    const { database, account } = await createSessionClient();
    const user = await account.get();

    const workspacesListRows = await database.listRows<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    });

    return await Promise.all(
      workspacesListRows.rows.map((workspace) => {
        return new Promise<ArrayValues<ResponseWorkspaces>>(
          async (res, rej) => {
            const [membersResponse, imageResponse] = await Promise.all([
              getMembersAction(workspace.teamId),
              workspace.imageId ? getImageAction(workspace.imageId) : undefined,
            ]);

            if (!membersResponse.success)
              return rej(new Error(membersResponse?.error.message));

            res({
              $id: workspace.$id,
              teamId: workspace.teamId,
              imageId: workspace.imageId,
              name: workspace.name,
              image: imageResponse
                ? { id: imageResponse.info.$id, blob: imageResponse.image.blob }
                : null,
              totalMembers: membersResponse.data.total,
              user: {
                roles: membersResponse.data.memberships.find(
                  (member) => member.userId === user.$id
                )!.roles,
              },
            });
          }
        );
      })
    );
  });
}

export async function getWorkspaceAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database, account } = await createSessionClient();
    const { users } = await createAdminClient();

    const user = await account.get();

    const workspace = await database.getRow<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
    });

    const [membersRes, imageRes, userRes] = await Promise.all([
      getMembersAction(workspace.teamId),
      workspace.imageId ? getImageAction(workspace.imageId) : undefined,
      users.get({ userId: workspace.userId }),
    ]);

    const members = unwrapDiscriminatedResponse(membersRes);

    return <ResponseWorkspace>{
      ...workspace,
      totalMembers: members.total,
      image: imageRes
        ? {
            id: imageRes.info.$id,
            blob: imageRes.image.blob,
          }
        : null,
      user: {
        roles: members.memberships.find((member) => member.userId === user.$id)!
          .roles,
      },
      owner: { name: userRes.name, id: workspace.userId },
    };
  });
}

export async function createWorkspaceAction(newWorkspace: WorkspaceSchema) {
  return handleResponse(async () => {
    const { name, image } = WorkspaceSchema.parse(newWorkspace);
    const { database, storage, account, Teams } = await createSessionClient();
    const user = await account.get();

    const transaction = new Transaction();

    const workspaceId = ID.unique();

    const uploadedImage = image
      ? await transaction.operation({
          name: 'upload workspace image',
          fn: () =>
            storage.createFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
              fileId: ID.unique(),
              file: image,
            }),
          rollbackFn: (file) =>
            storage.deleteFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
              fileId: file.$id,
            }),
        })()
      : undefined;

    const team = await transaction.operation({
      name: 'create workspace team',
      fn: () =>
        Teams.create({
          name,
          teamId: ID.unique(),
        }),
      rollbackFn: (team) => Teams.delete({ teamId: team.$id }),
    })();

    const workspace = team
      ? await transaction.operation({
          name: 'create workspace',
          fn: () => {
            return database.createRow<DatabaseWorkspace>({
              databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
              rowId: workspaceId,
              data: {
                imageId: uploadedImage?.$id ?? null,
                name,
                userId: user?.$id,
                teamId: team.$id,
              },
              permissions: [
                Permission.write(Role.user(user.$id)),
                Permission.read(Role.team(team.$id)),
              ],
            });
          },
          rollbackFn: (workspace) =>
            database.deleteRow({
              databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
              rowId: workspace.$id,
            }),
        })()
      : undefined;

    transaction.handleThrowError();

    if (!workspace) throw new Error('No workspace');

    return workspace;
  });
}

export async function updateWorkspaceNameAction(
  workspaceId: string,
  { name }: WorkspaceNameFormUpdateSchema
) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    return await database.updateRow<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
      data: {
        name,
      },
    });
  });
}

export async function updateWorkspaceImageAction(
  workspaceId: string,
  { image }: WorkspaceImageFormUpdateSchema
) {
  return handleResponse(async () => {
    const { database, storage } = await createSessionClient();

    const currentWorkspace = unwrapDiscriminatedResponse(
      await getWorkspaceAction(workspaceId)
    );
    const currentWorkspaceImage = currentWorkspace.imageId
      ? await getImageAction(currentWorkspace.imageId)
      : undefined;

    const transaction = new Transaction();

    const uploadedImage = image
      ? await transaction.operation({
          name: 'upload new avatar',
          fn: () =>
            storage.createFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
              fileId: ID.unique(),
              file: image,
            }),
          rollbackFn: (file) =>
            storage.deleteFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
              fileId: file.$id,
            }),
        })()
      : undefined;

    if (uploadedImage)
      await transaction.operation({
        name: 'update workspace image id',
        fn: () =>
          database.updateRow<DatabaseWorkspace>({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
            rowId: currentWorkspace.$id,
            data: {
              imageId: uploadedImage.$id,
            },
          }),
        rollbackFn: () =>
          database.updateRow<DatabaseWorkspace>({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
            rowId: workspaceId,
            data: {
              imageId: currentWorkspace.imageId,
            },
          }),
      })();

    if (currentWorkspaceImage)
      await transaction.operation({
        name: 'delete old image',
        fn: () =>
          storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: currentWorkspaceImage.info.$id,
          }),
        rollbackFn: async () => {
          if (!currentWorkspaceImage) return;

          await storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            file: new File(
              [currentWorkspaceImage.image.blob],
              currentWorkspaceImage.info.name,
              { type: currentWorkspaceImage.info.mimeType }
            ),
            fileId: currentWorkspaceImage.info.$id,
          });
        },
      })();

    transaction.handleThrowError();
  });
}

export async function deleteWorkspaceAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database, storage, Teams } = await createSessionClient();

    const workspace = unwrapDiscriminatedResponse(
      await getWorkspaceAction(workspaceId)
    );

    const image = workspace.imageId
      ? await getImageAction(workspace.imageId)
      : undefined;

    const team = (
      await Teams.list({ queries: [Query.equal('$id', workspace.teamId)] })
    ).teams[0];

    console.log({ team });

    const transaction = new Transaction();

    await transaction.operation({
      name: 'delete workspace',
      fn: () =>
        database.deleteRow({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
          rowId: workspaceId,
        }),
      rollbackFn: () =>
        database.createRow<DatabaseWorkspace>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
          rowId: workspace.$id,
          data: {
            name: workspace.name,
            imageId: workspace.imageId,
            teamId: workspace.teamId,
            userId: workspace.userId,
            $createdAt: workspace.$createdAt,
            $updatedAt: workspace.$updatedAt,
            $permissions: workspace.$permissions,
          },
          permissions: workspace.$permissions,
        }),
    })();

    await transaction.operation({
      name: 'delete projects',
      fn: async () => {
        const projects = unwrapDiscriminatedResponse(
          await getProjectsAction({ workspaceId })
        );

        return unwrapDiscriminatedResponse(
          await deleteProjectsAction(
            projects.rows.map((project) => project.$id)
          )
        );
      },
      rollbackFn: () => {},
    })();

    if (image)
      await transaction.operation({
        name: 'delete workspace image',
        fn: () =>
          storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: image.info.$id,
          }),
        rollbackFn: () => {
          storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: image.info.$id,
            file: new File([image.image.blob], image.info.name, {
              type: image.info.mimeType,
            }),
            permissions: image.info.$permissions,
          });
        },
      })();

    await transaction.operation({
      name: 'delete team',
      fn: () => Teams.delete({ teamId: workspace.teamId }),
      rollbackFn: () => {},
    })();

    transaction.handleThrowError();
  });
}

export async function leaveWorkspaceAction({
  teamId,
  membershipId,
}: {
  teamId: string;
  membershipId: string;
}) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();

    const membership = await Teams.getMembership({ teamId, membershipId });

    if (membership.roles.includes('owner'))
      throw new Error(
        'you are owner of this workspace and you can not leave but can delete workspace.'
      );

    await Teams.deleteMembership({ teamId, membershipId });
  });
}

export async function getWorkspaceAnalyticsAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database, account } = await createSessionClient();
    const user = await account.get();

    const now = new Date();
    const currentMonthInterval = getMonthInterval(now);
    const lastMonthInterval = getMonthInterval(subMonths(now, 1));

    const tasks = await database.listRows<DatabaseTask>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
      queries: [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual(
          '$createdAt',
          lastMonthInterval.start.toISOString()
        ),
      ],
    });

    const lastMonthTasks = tasks.rows.filter((task) =>
      isWithinInterval(task.$createdAt, lastMonthInterval)
    );
    const currentMonthTasks = tasks.rows.filter((task) =>
      isWithinInterval(task.$createdAt, currentMonthInterval)
    );
    const differenceTasksCount =
      currentMonthTasks.length - lastMonthTasks.length;

    const currentMonthAssigneeTasks = currentMonthTasks.filter(
      (task) => task.assigneeId === user.$id
    );
    const lastMonthAssigneeTasks = lastMonthTasks.filter(
      (task) => task.assigneeId === user.$id
    );
    const differenceAssigneeTasksCount =
      currentMonthAssigneeTasks.length - lastMonthAssigneeTasks.length;

    const currentMonthIncompleteTasks = currentMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const lastMonthIncompleteTasks = lastMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const differenceIncompleteTasksCount =
      currentMonthIncompleteTasks.length - lastMonthIncompleteTasks.length;

    const currentMonthCompletedTasks = currentMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const lastMonthCompletedTasks = lastMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const differenceCompletedTasksCount =
      currentMonthCompletedTasks.length - lastMonthCompletedTasks.length;

    const currentMonthOverDueTasks = currentMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE && isBefore(task.dueDate, now)
    );
    const lastMonthOverDueTasks = lastMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE && isBefore(task.dueDate, now)
    );
    const differenceOverDueTasksCount =
      currentMonthOverDueTasks.length - lastMonthOverDueTasks.length;

    return {
      tasksCount: currentMonthTasks.length,
      differenceTasksCount,
      assigneeTasksCount: currentMonthAssigneeTasks.length,
      differenceAssigneeTasksCount,
      incompleteTasksCount: currentMonthIncompleteTasks.length,
      differenceIncompleteTasksCount,
      completedTasksCount: currentMonthCompletedTasks.length,
      differenceCompletedTasksCount,
      overDueTasksCount: currentMonthOverDueTasks.length,
      differenceOverDueTasksCount,
    };
  });
}
