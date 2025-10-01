'use client';

import Toast from '@/components/Toast';
import { checkMemberInvitationAction } from '@/features/workspaces/actions';
import { InviteMembershipParamsSchema } from '@/features/workspaces/schemas';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const InviteCallbackPage = () => {
  const router = useRouter();
  useEffect(() => {
    const parseResult = InviteMembershipParamsSchema.safeParse(
      Object.fromEntries(new URL(location.href).searchParams.entries())
    );

    if (!parseResult.success) return;

    const data = parseResult.data;

    async function checkInvite() {
      const id = toast.custom(
        () => <Toast variant="loading" title="Checking invite..." />,
        { id: 'check-invite' }
      );
      const res = await checkMemberInvitationAction(data);
      if (res.success) {
        toast.custom(
          () => (
            <Toast variant="success" title="You have successfully Invited" />
          ),
          { id }
        );
        router.replace(`/workspaces/${data.workspaceId}`);
      } else {
        toast.custom(() => (
          <Toast
            variant="destructive"
            title="Invitation failed"
            description={res.error.message}
          />
        ));
        router.push('/');
      }
    }
    checkInvite();
  }, [router]);

  return null;
};

export default InviteCallbackPage;
