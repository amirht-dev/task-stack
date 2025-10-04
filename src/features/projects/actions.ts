'use server';

import { getImageAction } from '@/actions';
import { createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { ID, Permission, Query, Role } from 'node-appwrite';
import { getWorkspaceAction } from '../workspaces/actions';
import { CreateProjectFormSchema } from './schemas';
import { DatabaseProject } from './types';

export async function getProjectsAction({
  workspaceId,
}: {
  workspaceId: string;
}) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();
    const projectsList = await database.listRows<DatabaseProject>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
      queries: [Query.equal('workspace', workspaceId)],
    });

    const populatedProjects = await Promise.all(
      projectsList.rows.map(async (project) => {
        const image = project.imageId
          ? await getImageAction(project.imageId)
          : null;

        return {
          ...project,
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

    console.log({ workspace });

    const transaction = new Transaction({
      onError: ({ operationName, error }) => console.log(operationName, error),
    });

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
      fn: () =>
        database.createRow<DatabaseProject>({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
          rowId: ID.unique(),
          data: {
            name,
            workspace: workspaceId,
            ownerId: user.$id,
            imageId: projectImage?.$id ?? null,
            $permissions: [
              Permission.write(Role.user(user.$id)),
              Permission.write(Role.user(workspace.userId)),
              Permission.read(Role.team(workspace.teamId)),
            ],
          },
        }),
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
