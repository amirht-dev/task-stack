'use client';

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import sonner from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { leaveWorkspaceAction } from '../actions';
import useUserWorkspaceStatus from '../hooks/useUserWorkspaceStatus';
import useWorkspace from '../hooks/useWorkspace';

const LeaveWorkspaceDialog = () => {
  const [open, setOpen] = useState(false);
  const workspace = useWorkspace();
  const { membership, isOwner, isLoading } = useUserWorkspaceStatus();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (isLoading) return <Skeleton size="box" className="h-8.5 w-20" />;

  if (!workspace.isSuccess || isLoading || isOwner) return null;

  const handleLeave = () => {
    startTransition(async () => {
      if (!membership) return;

      setOpen(false);
      const id = sonner.loading({
        title: 'Leaving workspace...',
        toastData: {
          id: 'leave-workspace',
        },
      });
      const res = await leaveWorkspaceAction({
        teamId: workspace.data.teamId,
        membershipId: membership.$id,
      });

      if (res.success) {
        sonner.success({
          title: 'You left workspace',
          toastData: {
            id,
          },
        });
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        router.replace('/workspaces');
      } else {
        sonner.error({
          title: 'Failed to leave workspace',
          description: res.error.message,
          toastData: {
            id,
          },
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Leave</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            After leaving this workspace you can not access this workspace again
            until invited again
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleLeave}>
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveWorkspaceDialog;
