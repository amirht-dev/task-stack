'use client';

import Toast from '@/components/Toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { useQueryClient } from '@tanstack/react-query';
import { Models } from 'appwrite';
import { useParams } from 'next/navigation';
import { ReactNode, startTransition } from 'react';
import { toast } from 'sonner';
import { removeMembersAction } from '../actions';

function RemoveMemberDialog({
  trigger,
  memberships,
  onRemove,
}: {
  trigger: ReactNode;
  memberships: Models.Membership | Models.Membership[];
  onRemove?: () => void;
}) {
  const queryClient = useQueryClient();
  const { workspace_id } = useParams<{ workspace_id: string }>();
  const workspace = useWorkspaceQuery(workspace_id);
  const teamId = workspace.data?.teamId;

  const handleRemoveMember = async () => {
    if (!teamId) return;

    onRemove?.();
    startTransition(async () => {
      const id = toast.custom(
        () => (
          <Toast
            variant="loading"
            title={
              Array.isArray(memberships)
                ? `Removing ${memberships.length} members...`
                : `Removing ${memberships.userName}...`
            }
          />
        ),
        {
          id: Array.isArray(memberships)
            ? 'remove-members'
            : `remove-member-${memberships.$id}`,
        }
      );
      const res = await removeMembersAction({
        teamId,
        membershipIds: Array.isArray(memberships)
          ? memberships.map((member) => member.$id)
          : memberships.$id,
      });
      if (res.success) {
        toast.custom(
          () => (
            <Toast
              variant="success"
              title={
                Array.isArray(memberships)
                  ? `All ${memberships.length} members removed`
                  : `${memberships.userName} is removed`
              }
            />
          ),
          {
            id,
          }
        );
        await queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        });
      } else {
        toast.custom(
          () => (
            <Toast
              variant="destructive"
              title={
                Array.isArray(memberships)
                  ? `Failed to remove ${memberships.length} members`
                  : `Failed to remove ${memberships.userName}`
              }
              description={res.error.message}
            />
          ),
          {
            id,
          }
        );
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {Array.isArray(memberships)
              ? `Remove all ${memberships.length} members?`
              : `Remove ${memberships.userName}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{' '}
            {Array.isArray(memberships)
              ? `all ${memberships.length} members`
              : memberships.userName}{' '}
            from this workspace?. after removing members they lose their roles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRemoveMember}>
            {Array.isArray(memberships) ? 'Remove All' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RemoveMemberDialog;
