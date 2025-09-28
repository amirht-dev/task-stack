'use client';

import { useClientContext } from '@/contexts/ClientContext';
import useAuth from '@/features/auth/hooks/useAuth';
import { InviteMembershipParamsSchema } from '@/features/workspaces/schemas';
import { NextPage } from '@/types/next';
import { redirect, useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { toast } from 'sonner';

const InvitePage: NextPage = ({ searchParams }) => {
  const _searchParams = use(searchParams);
  const router = useRouter();
  const { refetchUser } = useAuth();
  const client = useClientContext();

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
        client.setJWTCookie();
        await refetchUser();
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
  }, [_searchParams, router, refetchUser, client]);

  return null;
};

export default InvitePage;
