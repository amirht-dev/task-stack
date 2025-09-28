'use client';

import { setJWTCookie } from '@/features/auth/actions';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { InviteMembershipParamsSchema } from '@/features/workspaces/schemas';
import { NextPage } from '@/types/next';
import { redirect, useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { toast } from 'sonner';

const InvitePage: NextPage = ({ searchParams }) => {
  const _searchParams = use(searchParams);
  const router = useRouter();
  const { updateUser, client } = useAuthContext();

  useEffect(() => {
    const { success, data } =
      InviteMembershipParamsSchema.safeParse(_searchParams);
    if (!success) return redirect('/');

    const { teamId, membershipId, userId, secret, workspaceId } = data;

    const confirmInvite = async () => {
      const id = toast.loading('Validating invite...', {
        id: 'invite-validation',
        description: '',
      });
      try {
        await client.teams.updateMembershipStatus(
          teamId,
          membershipId,
          userId,
          secret
        );
        const { jwt } = await client.account.createJWT();
        await setJWTCookie(jwt);
        await updateUser();
        toast.success('You have successfully invited', { id, description: '' });
        router.replace(`/workspaces/${workspaceId}`);
      } catch (error) {
        toast.success('Failed to validate invite', {
          id,
          description:
            error instanceof Error
              ? error.message
              : typeof error === 'string'
              ? error
              : '',
        });
      }
    };
    confirmInvite();
  }, [_searchParams, router, updateUser, client]);

  return null;
};

export default InvitePage;
