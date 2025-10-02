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
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { toast } from 'sonner';
import { leaveWorkspaceAction } from '../actions';
import useUserWorkspaceStatus from '../hooks/useUserWorkspaceStatus';
import useWorkspace from '../hooks/useWorkspace';
import { Skeleton } from '@/components/ui/skeleton';

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
      toast.custom(
        () => <Toast variant="loading" title="Leaving workspace..." />,
        { id: 'leave-workspace' }
      );
      const res = await leaveWorkspaceAction({
        teamId: workspace.data.teamId,
        membershipId: membership.$id,
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        toast.custom(
          () => <Toast variant="success" title="You left workspace" />,
          { id: 'leave-workspace' }
        );
        router.replace('/workspaces');
      } else {
        toast.custom(
          () => (
            <Toast
              variant="destructive"
              title="Failed to leave workspace"
              description={res.error.message}
            />
          ),
          { id: 'leave-workspace' }
        );
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
