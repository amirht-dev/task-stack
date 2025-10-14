'use server';

import { getImageAction } from '@/actions';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import {
  endOfMonth,
  interval,
  isBefore,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ID, Permission, Query, Role } from 'node-appwrite';
import { deleteTasksAction, getTasksAction } from '../tasks/actions';
import { DatabaseTask, TaskStatus } from '../tasks/types';
import { getWorkspaceAction } from '../workspaces/actions';
import {
  CreateProjectFormSchema,
  UpdateProjectImageFormSchema,
  UpdateProjectNameFormSchema,
} from './schemas';
import { DatabaseProject } from './types';

export async function getProjectsAction({
  workspaceId,
}: {
  workspaceId: string;
}) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();
    const { users } = await createAdminClient();
    const projectsList = await database.listRows<DatabaseProject>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
      queries: [Query.equal('workspaceId', workspaceId)],
    });

    const populatedProjects = await Promise.all(
      projectsList.rows.map(async (project) => {
        const image = project.imageId
          ? await getImageAction(project.imageId)
          : null;

        const owner = await users.get({ userId: project.ownerId });

        return {
          ...project,
          owner: { id: owner.$id, name: owner.name },
          image: image ? { id: image.info.$id, blob: image.image.blob } : null,
        };
      })
    );

    return {
      ...projectsList,
      rows: populatedProjects,
    };
  });
}

export async function createProjectAction({
  workspaceId,
  name,
  image,
}: CreateProjectFormSchema) {
  return handleResponse(async () => {
    const { account, database, storage } = await createSessionClient();
    const user = await account.get();

    const workspace = unwrapDiscriminatedResponse(
      await getWorkspaceAction(workspaceId)
    );

    const transaction = new Transaction();

    const projectImage = await transaction.operation({
      name: 'upload image',
      fn: async () =>
        image
          ? await storage.createFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
              file: image,
              fileId: ID.unique(),
            })
          : undefined,
      rollbackFn: (image) => {
        if (!image) return;

        storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: image?.$id,
        });
      },
    })();

    const project = await transaction.operation({
      name: 'create project',
      fn: async () => {
        const admin = await createAdminClient();
        const project = await database.createRow<DatabaseProject>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: ID.unique(),
          data: {
            name,
            workspaceId,
            ownerId: user.$id,
            imageId: projectImage?.$id ?? null,
          },
        });

        const updatedProject = await admin.database.updateRow<DatabaseProject>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: project.$id,
          permissions: [
            Permission.write(Role.user(user.$id)),
            Permission.read(Role.user(user.$id)),
            Permission.write(Role.team(workspace.teamId, 'owner')),
            Permission.read(Role.team(workspace.teamId)),
          ],
        });
        return updatedProject;
      },
      rollbackFn: (project) =>
        database.deleteRow({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: project.$id,
        }),
    })();

    transaction.handleThrowError();

    return project;
  });
}

export async function getProjectAction(projectId: string) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const project = await database.getRow<DatabaseProject>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
      rowId: projectId,
    });

    const image = project.imageId
      ? await getImageAction(project.imageId)
      : undefined;

    return {
      ...project,
      image: image ? { id: image.info.$id, blob: image.image.blob } : null,
    };
  });
}

export async function updateProjectNameAction(
  projectId: string,
  { name }: UpdateProjectNameFormSchema
) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    return database.updateRow<DatabaseProject>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
      rowId: projectId,
      data: {
        name,
      },
    });
  });
}

export async function updateProjectImageAction(
  projectId: string,
  { image }: UpdateProjectImageFormSchema
) {
  return handleResponse(async () => {
    const { database, storage } = await createSessionClient();

    const currentProject = unwrapDiscriminatedResponse(
      await getProjectAction(projectId)
    );

    const transaction = new Transaction();

    const newImage = await transaction.operation({
      name: 'upload new image',
      fn: async () => {
        if (image)
          return storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: ID.unique(),
            file: image,
          });
      },
      rollbackFn: (image) => {
        if (image)
          storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: image.$id,
          });
      },
    })();

    const updatedProject = await transaction.operation({
      name: 'update project',
      fn: async () => {
        if (newImage)
          return database.updateRow<DatabaseProject>({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
            rowId: projectId,
            data: {
              imageId: newImage.$id,
            },
          });
      },
      rollbackFn: () =>
        database.updateRow<DatabaseProject>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: projectId,
          data: {
            imageId: currentProject.imageId,
          },
        }),
    })();

    await transaction.operation({
      name: 'remove old image',
      fn: async () => {
        const currentImage = currentProject.imageId
          ? await getImageAction(currentProject.imageId)
          : undefined;
        if (currentImage)
          storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: currentImage.info.$id,
          });
        return currentImage;
      },
      rollbackFn: async (oldImage) => {
        if (oldImage)
          storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: oldImage.info.$id,
            file: new File([oldImage.image.blob], oldImage.info.name, {
              type: oldImage.info.mimeType,
            }),
          });
      },
    })();

    transaction.handleThrowError();

    if (!updatedProject) throw new Error('no updated project');

    return updatedProject;
  });
}

export async function deleteProjectAction(projectId: string) {
  return handleResponse(async () => {
    const { database, storage } = await createSessionClient();

    const currentProject = unwrapDiscriminatedResponse(
      await getProjectAction(projectId)
    );

    const image = currentProject.imageId
      ? await getImageAction(currentProject.imageId)
      : undefined;

    const transaction = new Transaction();

    await transaction.operation({
      name: 'delete project tasks',
      fn: async () => {
        const tasks = unwrapDiscriminatedResponse(
          await getTasksAction(currentProject.$id)
        );
        if (tasks.length)
          return unwrapDiscriminatedResponse(
            await deleteTasksAction(tasks.map((task) => task.$id))
          );
      },
      rollbackFn: async (tasks) => {
        if (!tasks) return;
        const { database } = await createAdminClient();
        database.createRows<DatabaseTask>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID,
          rows: tasks,
        });
      },
    })();

    await transaction.operation({
      name: 'delete project',
      fn: async () => {
        return database.deleteRow({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: projectId,
        });
      },
      rollbackFn: () =>
        database.createRow<DatabaseProject>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: currentProject.$id,
          data: {
            name: currentProject.name,
            ownerId: currentProject.ownerId,
            imageId: currentProject.imageId,
            workspaceId: currentProject.workspaceId,
            $createdAt: currentProject.$createdAt,
            $updatedAt: currentProject.$updatedAt,
          },
          permissions: currentProject.$permissions,
        }),
    })();

    await transaction.operation({
      name: 'delete image',
      fn: async () => {
        if (image)
          storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: image.info.$id,
          });
      },
      rollbackFn: async () => {
        if (!image) return;
        await storage.createFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: image.info.$id,
          file: new File([image.image.blob], image.info.name, {
            type: image.info.mimeType,
          }),
        });
      },
    })();

    transaction.handleThrowError();

    return currentProject;
  });
}

export async function deleteProjectsAction(projectIds: string[]) {
  return handleResponse(async () => {
    const projects = await Promise.all(
      projectIds.map(async (projectId) => {
        return unwrapDiscriminatedResponse(
          await deleteProjectAction(projectId)
        );
      })
    );

    return projects;
  });
}

function getMonthInterval(month: Date) {
  return interval(startOfMonth(month), endOfMonth(month));
}

export async function getProjectAnalyticsAction(projectId: string) {
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
        Query.equal('projectId', projectId),
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
