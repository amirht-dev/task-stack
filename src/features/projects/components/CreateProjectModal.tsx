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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { generateRandomColorImageFile } from '@/utils/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowsRotate } from 'react-icons/fa6';
import useWorkspacesQuery from '../../workspaces/hooks/useWorkspacesQuery';
import useCreateProject from '../hooks/useCreateProject';
import { CreateProjectFormSchema } from '../schemas';

type WorkspaceFormDialogProps = {
  trigger: ReactNode;
  defaultWorkspaceId?: string;
};

const CreateProjectModal = ({
  trigger,
  defaultWorkspaceId,
}: WorkspaceFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<FileWithPreview>();
  const workspaces = useWorkspacesQuery();
  const { selectedWorkspace } = useSelectWorkspace();
  const form = useForm<CreateProjectFormSchema>({
    defaultValues: {
      name: '',
      workspaceId: defaultWorkspaceId ?? selectedWorkspace?.$id ?? '',
      image: null,
    },
    disabled: workspaces.isLoading,
    resolver: zodResolver(CreateProjectFormSchema),
  });
  const { mutate: createProject } = useCreateProject();

  const { isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;
    createProject(data, { onSuccess: () => setOpen(false) });
  });

  return (
    <ResponsibleModal open={open} onOpenChange={setOpen}>
      <ResponsibleModalTrigger asChild>{trigger}</ResponsibleModalTrigger>
      <ResponsibleModalContent className="container">
        <ResponsibleModalHeader>
          <ResponsibleModalTitle className="capitalize">
            Create New Project
          </ResponsibleModalTitle>
        </ResponsibleModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>image:</FormLabel>
                  <div className="flex justify-between">
                    <ImageInput
                      {...field}
                      file={file}
                      onFileChange={(file) => {
                        setFile(file);
                        form.setValue(
                          'image',
                          file?.file instanceof File ? file.file : null,
                          { shouldDirty: true }
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

            <FormField
              control={form.control}
              name="workspaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace:</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.data?.map((workspace) => (
                          <SelectItem key={workspace.$id} value={workspace.$id}>
                            <span className="flex items-center gap-2">
                              <Avatar className="size-5">
                                {workspace.image && (
                                  <AvatarImage
                                    src={workspace.image.url}
                                    alt={workspace.name}
                                  />
                                )}
                              </Avatar>
                              <span>{workspace.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                Create Project
              </Button>
            </ResponsibleModalFooter>
          </form>
        </Form>
      </ResponsibleModalContent>
    </ResponsibleModal>
  );
};

export default CreateProjectModal;
