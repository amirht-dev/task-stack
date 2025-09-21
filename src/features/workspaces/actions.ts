'use server';

import { Workspace, WorkspaceWithImageBlob } from '@/features/workspaces/types';
import { createSessionClient } from '@/lib/appwrite/server';
import { handleResponse } from '@/utils/server';
import { ID, Models } from 'node-appwrite';
import { WorkspaceSchema } from './schemas';

export async function getWorkspacesAction() {
  return handleResponse(async () => {
    const { database, storage } = await createSessionClient();

    const workspacesListRows = await database.listRows<Workspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    });

    const rowsWithImageBlob = await Promise.all(
      workspacesListRows.rows.map((row) => {
        return new Promise<Workspace & { imageBlob: Blob | null }>(
          async (res, rej) => {
            let imageBlob: Blob | null = null;
            const imageId = row.imageId;

            try {
              if (imageId) {
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

                imageBlob = new Blob([arrayBuffer], { type: data.mimeType });
              }
            } catch (error) {
              rej(error);
            }

            res(<WorkspaceWithImageBlob>{
              ...row,
              imageBlob,
            });
          }
        );
      })
    );

    return <Models.RowList<WorkspaceWithImageBlob>>{
      ...workspacesListRows,
      rows: rowsWithImageBlob,
    };
  });
}

export async function createWorkspaceAction(newWorkspace: unknown) {
  return handleResponse(async () => {
    const workspace = WorkspaceSchema.parse(newWorkspace);
    const { database, storage, account } = await createSessionClient();
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
      return await database.createRow<Workspace>({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        rowId: ID.unique(),
        data: {
          imageId: uploadedFile?.$id ?? null,
          name: workspace.name,
          userId: user?.$id,
        },
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
