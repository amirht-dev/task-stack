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
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { inviteMemberAction } from '../actions';
import { getWorkspaceQueryOptions } from '../hooks/useWorkspaceQuery';
import { InviteMemberFormSchema } from '../schemas';

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

  const { isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    const id = toast.loading('Inviting member...', {
      id: 'invite-member',
      description: '',
    });
    const res = await inviteMemberAction({ email, teamId, workspaceId });

    if (res.success) {
      toast.success('Member invited', {
        id,
        description: (
          <>
            invitation email has sent to <strong>{res.data.userEmail}</strong>{' '}
            email address
          </>
        ),
      });
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: getWorkspaceQueryOptions(workspaceId).queryKey,
      });
    } else {
      toast.error('Failed to invite member', {
        id,
        description: res.error.message,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserRoundPlus />
          Invite member
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
