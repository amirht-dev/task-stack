'use client';

import { checkMemberInvitationAction } from '@/features/members/actions';
import { InviteMembershipParamsSchema } from '@/features/workspaces/schemas';
import sonner from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const InviteCallbackPage = () => {
  const router = useRouter();
  useEffect(() => {
    const parseResult = InviteMembershipParamsSchema.safeParse(
      Object.fromEntries(new URL(location.href).searchParams.entries())
    );

    if (!parseResult.success) return;

    const data = parseResult.data;

    async function checkInvite() {
      const id = sonner.loading({
        title: 'Checking invite...',
        toastData: {
          id: 'check-invite',
        },
      });
      const res = await checkMemberInvitationAction(data);
      if (res.success) {
        sonner.success({
          title: 'You have successfully Invited',
          toastData: {
            id,
          },
        });
        router.replace(`/workspaces/${data.workspaceId}`);
      } else {
        sonner.error({
          title: 'Invitation failed',
          description: res.error.message,
          toastData: {
            id,
          },
        });
        router.push('/');
      }
    }
    checkInvite();
  }, [router]);

  return null;
};

export default InviteCallbackPage;
