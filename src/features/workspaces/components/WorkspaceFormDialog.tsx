import ImageInput from '@/components/ImageInput';
import {
  ResponsibleModal,
  ResponsibleModalClose,
  ResponsibleModalContent,
  ResponsibleModalFooter,
  ResponsibleModalHeader,
  ResponsibleModalTitle,
  ResponsibleModalTrigger,
} from '@/components/ResponsibleModal';
import Toast from '@/components/Toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { generateRandomColorImageFile } from '@/utils/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowsRotate } from 'react-icons/fa6';
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
  const [file, setFile] = useState<FileWithPreview>();
  const form = useForm<WorkspaceSchema>({
    defaultValues: {
      name: '',
      image: null,
    },
    resolver: zodResolver(WorkspaceSchema),
  });
  const router = useRouter();

  const { isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;

    const toastId = toast.custom(
      () => <Toast variant="loading" title="Creating workspace..." />,
      {
        id: 'create-workspace-toast',
      }
    );

    const res = await createWorkspaceAction(data);

    if (res.success) {
      setOpen(false);
      toast.custom(
        () => <Toast variant="success" title="Workspace created" />,
        {
          id: toastId,
        }
      );
      form.reset();
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryOptions().queryKey,
      });
      router.push(`/workspaces/${res.data.$id}`);
    } else {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to create workspace"
            description={res.error.message}
          />
        ),
        {
          id: toastId,
        }
      );
    }
  });

  return (
    <ResponsibleModal open={open} onOpenChange={setOpen}>
      <ResponsibleModalTrigger asChild>{trigger}</ResponsibleModalTrigger>
      <ResponsibleModalContent className="container">
        <ResponsibleModalHeader>
          <ResponsibleModalTitle className="capitalize">
            Add New Workspace
          </ResponsibleModalTitle>
        </ResponsibleModalHeader>

        <Form {...form}>
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
                  <div className="flex justify-between">
                    <ImageInput
                      name={field.name}
                      ref={field.ref}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      file={file}
                      onFileChange={(file) => {
                        setFile(file);
                        form.setValue(
                          'image',
                          file?.file instanceof File ? file.file : null
                        );
                      }}
                      onError={(errors) =>
                        errors.forEach((err) =>
                          form.setError('image', { message: err })
                        )
                      }
                    />
                    <Button
                      variant="dim"
                      type="button"
                      onClick={async () => {
                        const file = await generateRandomColorImageFile();
                        setFile((prev) => {
                          if (prev?.preview) URL.revokeObjectURL(prev.preview);

                          return {
                            file,
                            id: 'random-color',
                            preview: URL.createObjectURL(file),
                          };
                        });
                        form.setValue('image', file);
                      }}
                    >
                      <FaArrowsRotate />
                      <span>random color</span>
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <ResponsibleModalFooter>
              <ResponsibleModalClose
                onClick={() => form.reset()}
                disabled={isSubmitting}
                asChild
              >
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </ResponsibleModalClose>

              <Button type="submit" disabled={isSubmitting}>
                Add Workspace
              </Button>
            </ResponsibleModalFooter>
          </form>
        </Form>
      </ResponsibleModalContent>
    </ResponsibleModal>
  );
};

export default WorkspaceFormDialog;
