'use server';

import { DatabaseWorkspace } from '@/features/workspaces/types';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse } from '@/utils/server';
import { ID, Models, Permission, Role } from 'node-appwrite';
import {
  InviteMemberFormSchema,
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
    const list = await Teams.listMemberships({
      teamId: teamId,
    });
    // list.memberships.map((member) => {
    //   return new Promise((res) => {});
    // });
    return list;
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
        return new Promise<
          DatabaseWorkspace & { imageBlob: Blob | null; totalMembers: number }
        >(async (res, rej) => {
          const [membersResponse, imageResponse] = await Promise.all([
            getWorkspaceMembersAction(workspace.teamId),
            workspace.imageId
              ? getWorkspaceImageAction(workspace.imageId)
              : undefined,
          ]);

          if (!membersResponse.success)
            return rej(new Error(membersResponse?.error.message));
          if (imageResponse && !imageResponse.success)
            return rej(new Error(imageResponse.error.message));

          res({
            ...workspace,
            imageBlob: imageResponse?.data.image ?? null,
            totalMembers: membersResponse.data.total,
          });
        });
      })
    );

    return {
      ...workspacesListRows,
      rows: rowsWithImageBlob,
    };
  });
}

export async function getWorkspaceAction(workspaceId: string) {
  return handleResponse(async () => {
    const { database } = await createSessionClient();
    const { users } = await createAdminClient();

    const workspace = await database.getRow<DatabaseWorkspace>({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      rowId: workspaceId,
    });

    const [membersRes, imageRes, userRes] = await Promise.all([
      getWorkspaceMembersAction(workspace.teamId),
      workspace.imageId
        ? getWorkspaceImageAction(workspace.imageId)
        : undefined,
      users.get({ userId: workspace.userId }),
    ]);

    if (!membersRes.success) throw new Error(membersRes.error.message);
    if (imageRes && !imageRes.success) throw new Error(imageRes.error.message);

    return {
      ...workspace,
      user: { name: userRes.name },
      imageBlob: imageRes?.data.image ?? null,
      members: membersRes.data,
    };
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

    if (!workspaceResult.success)
      throw new Error(workspaceResult.error.message);

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

    if (!workspaceRes.success) throw new Error(workspaceRes.error.message);

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

export async function inviteMemberAction({
  workspaceId,
  teamId,
  email,
}: InviteMemberFormSchema & { workspaceId: string; teamId?: string }) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();

    let membership: Models.Membership | null = null;

    async function createMembership(teamId: string) {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_ORIGIN_URL}/api/invite/callback`
      );
      url.searchParams.set('workspaceId', workspaceId);

      return await Teams.createMembership({
        teamId,
        roles: ['member'],
        email,
        url: url.toString(),
      });
    }

    if (teamId) {
      membership = await createMembership(teamId);
    } else {
      const res = await getWorkspaceAction(workspaceId);
      if (!res.success) throw new Error(res.error.message);
      membership = await createMembership(res.data.teamId);
    }

    if (!membership) throw new Error('missing membership');

    return membership;
  });
}
