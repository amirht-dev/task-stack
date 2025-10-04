'use server';

import { createPublicClient } from '@/lib/appwrite/client';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { OneOrMore } from '@/types/utils';
import { handleResponse, unwrapDiscriminatedResponse } from '@/utils/server';
import { Transaction } from '@/utils/transaction';
import { Models, Query } from 'node-appwrite';
import { setSessionCookie } from '../auth/utils/server';
import {
  createProfileAction,
  deleteProfileAsAdminAction,
} from '../profile/actions';
import { getWorkspaceAction } from '../workspaces/actions';
import {
  InviteMemberFormSchema,
  InviteMembershipParamsSchema,
} from '../workspaces/schemas';

export async function getMembersAction(teamId: string) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();

    const list = await Teams.listMemberships({
      teamId: teamId,
    });
    return list;
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

export async function removeMembersAction({
  teamId,
  membershipIds,
}: {
  teamId: string;
  membershipIds: OneOrMore<string>;
}) {
  return handleResponse(async () => {
    const { Teams } = await createSessionClient();
    if (Array.isArray(membershipIds))
      await Promise.all(
        membershipIds.map((membershipId) =>
          Teams.deleteMembership({
            teamId,
            membershipId,
          })
        )
      );
    else
      await Teams.deleteMembership({
        teamId,
        membershipId: membershipIds,
      });
  });
}
