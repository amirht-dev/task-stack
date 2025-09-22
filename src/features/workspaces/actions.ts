'use server';

import {
  DatabaseWorkspace,
  ResponseWorkspace,
} from '@/features/workspaces/types';
import { createSessionClient } from '@/lib/appwrite/server';
import { DiscriminatedResponseWithData } from '@/types/utils';
import { handleResponse } from '@/utils/server';
import { ID, Models, Permission, Role } from 'node-appwrite';
import {
  WorkspaceImageFormUpdateSchema,
  WorkspaceNameFormUpdateSchema,
  WorkspaceSchema,
} from './schemas';

export async function getWorkspaceImageAction(imageId: string) {
  return handleResponse(async () => {
    const { storage } = await createSessionClient();

    const ArrayBufferPromise = storage.getFileView({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    });

    const dataPromise = storage.getFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    });

    const [arrayBuffer, data] = await Promise.all([
      ArrayBufferPromise,
      dataPromise,
    ]);

    return {
      data,
      image: new Blob([arrayBuffer], { type: data.mimeType }),
    };
  });
}

export async function getWorkspaceMembersAction(teamId: string) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();
    return await Teams.listMemberships({
      teamId: teamId,
    });
  });
}

export async function getWorkspacesAction() {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    const workspacesListRows = await database.listRows<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    });

    const rowsWithImageBlob = await Promise.all(
      workspacesListRows.rows.map((workspace) => {
        return new Promise<ResponseWorkspace>(async (res, rej) => {
          let workspaceImagePromise:
            | Promise<
                DiscriminatedResponseWithData<{
                  data: Models.File;
                  image: Blob;
                }>
              >
            | undefined = undefined;

          if (workspace.imageId)
            workspaceImagePromise = getWorkspaceImageAction(workspace.imageId);

          const [membersResponse, imageResponse] = await Promise.all([
            getWorkspaceMembersAction(workspace.teamId),
            workspaceImagePromise,
          ]);

          if (!membersResponse.success)
            return rej(new Error(membersResponse?.error));
          if (imageResponse && !imageResponse.success)
            return rej(new Error(imageResponse.error));

          res({
            ...workspace,
            imageBlob: imageResponse?.data.image ?? null,
            members: membersResponse.data,
          } satisfies ResponseWorkspace);
        });
      })
    );

    return <Models.RowList<ResponseWorkspace>>{
      ...workspacesListRows,
      rows: rowsWithImageBlob,
    };
  });
}

export async function getWorkspaceAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();

    return await database.getRow<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
    });
  });
}

export async function createWorkspaceAction(newWorkspace: unknown) {
  return handleResponse(async () => {
    const workspace = WorkspaceSchema.parse(newWorkspace);
    const { database, storage, account, Teams } = await createSessionClient();
    const user = await account.get();

    let uploadedFile: Models.File | null = null;

    if (workspace.image) {
      uploadedFile = await storage.createFile({
        bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
        fileId: ID.unique(),
        file: workspace.image,
      });
    }

    try {
      const workspaceId = ID.unique();

      const team = await Teams.create({
        name: `workspace_${workspaceId}_members`,
        teamId: ID.unique(),
      });

      return await database.createRow<DatabaseWorkspace>({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        rowId: workspaceId,
        data: {
          imageId: uploadedFile?.$id ?? null,
          name: workspace.name,
          userId: user?.$id,
          teamId: team.$id,
        },
        permissions: [
          Permission.write(Role.user(user.$id)),
          Permission.read(Role.team(team.$id)),
        ],
      });
    } catch (error) {
      if (uploadedFile)
        await storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: uploadedFile.$id,
        });
      throw error;
    }
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

    const workspaceResult = await getWorkspaceAction(workspaceId);

    if (!workspaceResult.success) throw new Error(workspaceResult.error);

    const { data: workspace } = workspaceResult;

    const deleteOldImagePromise = workspace.imageId
      ? storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: workspace.imageId,
        })
      : undefined;

    const uploadNewImagePromise = new Promise<Models.File>(async (res, rej) => {
      try {
        if (image) {
          const result = await storage.createFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
            fileId: ID.unique(),
            file: image,
          });
          res(result);
        }
      } catch (error) {
        rej(error);
      }
    });

    const [, newImageResponse] = await Promise.all([
      deleteOldImagePromise,
      uploadNewImagePromise,
    ]);

    const updatedWorkspace = await database.updateRow<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
      data: {
        imageId: newImageResponse.$id,
      },
    });

    return updatedWorkspace;
  });
}

export async function deleteWorkspaceAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database, storage, Teams } = await createSessionClient();

    const workspaceRes = await getWorkspaceAction(workspaceId);

    if (!workspaceRes.success) throw new Error(workspaceRes.error);

    const { data: workspace } = workspaceRes;

    const deleteWorkspacePromise = database.deleteRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
    });

    const deleteWorkspaceImagePromise = workspace.imageId
      ? storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          fileId: workspace.imageId,
        })
      : undefined;

    const deleteWorkspaceTeamPromise = Teams.delete({
      teamId: workspace.teamId,
    });

    await Promise.all([
      deleteWorkspacePromise,
      deleteWorkspaceImagePromise,
      deleteWorkspaceTeamPromise,
    ]);
  });
}
