import ImageInput from '@/components/ImageInput';
import { Button } from '@/components/ui/button';
import DialogContent, {
  Dialog,
  DialogBody,
  DialogClose,
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
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createWorkspaceAction } from '../actions';
import { getWorkspacesQueryOptions } from '../hooks/useWorkspacesQuery';
import { WorkspaceSchema } from '../schemas';

type WorkspaceFormDialogProps = {
  trigger: ReactNode;
};

const WorkspaceFormDialog = ({ trigger }: WorkspaceFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<WorkspaceSchema>({
    defaultValues: {
      name: '',
      image: null,
    },
    resolver: zodResolver(WorkspaceSchema),
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;

    const toastId = toast.loading('creating workspace...', {
      id: 'create-workspace-toast',
      description: '',
    });

    const res = await createWorkspaceAction(data);

    if (res.success) {
      setOpen(false);
      toast.success('Workspace created', {
        description: (
          <>
            <strong>{res.data.name}</strong> workspace is created successfully
          </>
        ),
        id: toastId,
      });
      form.reset();
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryOptions().queryKey,
      });
    } else {
      toast.error('Failed to create workspace', {
        description: res.error,
        id: toastId,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Add New Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <DialogBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name:</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workspace name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace image:</FormLabel>
                    <ImageInput
                      name={field.name}
                      ref={field.ref}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      onFilesChange={(files) => {
                        const file = files[0]?.file;
                        field.onChange(file instanceof File ? file : null);
                      }}
                      onError={(errors) =>
                        errors.forEach((err) =>
                          form.setError('image', { message: err })
                        )
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                  asChild
                >
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={isSubmitting}>
                  Add Workspace
                </Button>
              </DialogFooter>
            </form>
          </DialogBody>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceFormDialog;
