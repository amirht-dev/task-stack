import Toast from '@/components/Toast';
import { Button } from '@/components/ui/button';
import DialogContent, {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import useIsDesktop from '@/hooks/useIsDesktop';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getWorkspaceQueryOptions } from '../../workspaces/hooks/useWorkspaceQuery';
import { InviteMemberFormSchema } from '../../workspaces/schemas';
import { inviteMemberAction } from '../actions';

type InviteMemberDialogProps = {
  teamId: string;
  workspaceId: string;
};

const InviteMemberDialog = ({
  teamId,
  workspaceId,
}: InviteMemberDialogProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(InviteMemberFormSchema),
  });
  const isDesktop = useIsDesktop();

  const { isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    const id = toast.custom(
      () => <Toast variant="loading" title="Inviting member..." />,
      {
        id: 'invite-member',
      }
    );
    const res = await inviteMemberAction({ email, teamId, workspaceId });

    if (res.success) {
      toast.custom(
        () => (
          <Toast
            variant="success"
            title="Member invited"
            description={
              <>
                invitation email has sent to{' '}
                <strong>{res.data.userEmail}</strong> email address
              </>
            }
          />
        ),
        {
          id,
        }
      );
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: getWorkspaceQueryOptions(workspaceId).queryKey,
      });
    } else {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to invite member"
            description={res.error.message}
          />
        ),
        {
          id,
        }
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={isDesktop ? 'md' : 'icon'}>
          <UserRoundPlus />
          <span className="hidden lg:inline">Invite member</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite new member</DialogTitle>
          <DialogDescription>
            send an invitation email to this email
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address:</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Email Address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild onClick={() => form.reset()}>
                <Button type="button" variant="ghost" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                Invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
