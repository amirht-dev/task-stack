'use server';

import { getImageAction } from '@/actions';
import { DatabaseWorkspace } from '@/features/workspaces/types';
import { createPublicClient } from '@/lib/appwrite/client';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { ID, Models, Permission, Query, Role } from 'node-appwrite';
import {
  createProfileAction,
  deleteProfileAsAdminAction,
} from '../auth/actions';
import { setSessionCookie } from '../auth/utils/server';
import {
  InviteMemberFormSchema,
  InviteMembershipParamsSchema,
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
      workspace.imageId ? getImageAction(workspace.imageId) : undefined,
      users.get({ userId: workspace.userId }),
    ]);

    const members = unwrapDiscriminatedResponse(membersRes);

    return {
      ...workspace,
      user: { name: userRes.name },
      imageBlob: imageRes?.image.blob ?? null,
      members,
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
      rollbackFn: async () => {
        const { teams } = await createAdminClient();
        await teams.create({ name: team.name, teamId: team.$id });
        Promise.all(
          workspace.members.memberships.map((member) =>
            teams.createMembership(member)
          )
        );
      },
    })();

    transaction.handleThrowError();
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
        `${process.env.NEXT_PUBLIC_ORIGIN_URL}/invite/callback`
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
      const workspace = unwrapDiscriminatedResponse(
        await getWorkspaceAction(workspaceId)
      );
      membership = await createMembership(workspace.teamId);
    }

    if (!membership) throw new Error('missing membership');

    return membership;
  });
}

export async function checkMemberInvitationAction(
  data: InviteMembershipParamsSchema
) {
  return handleResponse(async () => {
    const { teamId, membershipId, secret, userId } = data;

    const { teams } = createPublicClient();
    const { users, database } = await createAdminClient();

    const transaction = new Transaction();

    const listProfiles = await database.listRows({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_ID,
      queries: [Query.equal('userId', userId)],
    });

    if (listProfiles.total === 0)
      await transaction.operation({
        name: 'create profile',
        fn: async () =>
          unwrapDiscriminatedResponse(await createProfileAction(userId)),
        rollbackFn: (profile) => deleteProfileAsAdminAction(profile.$id),
      })();

    await transaction.operation({
      name: 'update membership status',
      fn: () =>
        teams.updateMembershipStatus(teamId, membershipId, userId, secret),
      rollbackFn: () => {},
    })();

    const session = await transaction.operation({
      name: 'create session',
      fn: () =>
        users.createSession({
          userId,
        }),
      rollbackFn: (session) =>
        users.deleteSession({ userId: session.userId, sessionId: session.$id }),
    })();

    transaction.handleThrowError();

    if (!session) throw new Error('No session');

    await setSessionCookie(session);
  });
}

export async function removeMemberAction(teamId: string, membershipId: string) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();
    await Teams.deleteMembership({ teamId, membershipId });
  });
}
