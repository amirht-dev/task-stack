'use client';

import ImageInputField from '@/components/ImageInputField';
import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardFooter,
  SectionCardFormActionButton,
  SectionCardHeader,
  SectionCardRow,
  SectionCardTitle,
} from '@/components/SectionCard';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/features/auth/hooks/useAuth';
import useDeleteProject from '@/features/projects/hooks/useDeleteProject';
import useProjectParam from '@/features/projects/hooks/useProjectParam';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import useUpdateProjectImage from '@/features/projects/hooks/useUpdateProjectImage';
import useUpdateProjectName from '@/features/projects/hooks/useUpdateProjectName';
import {
  UpdateProjectImageFormSchema,
  UpdateProjectNameFormSchema,
} from '@/features/projects/schemas';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect, useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const ProjectSettingsPage = ({
  params,
}: PageProps<'/workspaces/[workspace_id]/projects/[project_id]/settings'>) => {
  const { project_id, workspace_id } = use(params);
  const project = useProjectQuery();
  const workspace = useWorkspaceQuery();

  const { user } = useAuth();

  if (
    (project.isSuccess && project.data.ownerId !== user?.$id) ||
    (workspace.isSuccess && workspace.data.userId !== user?.$id)
  )
    redirect(`/workspaces/${workspace_id}/projects/${project_id}`);

  return (
    <div className="space-y-6">
      <UpdateNameSection />
      <UpdateImageSection />
      <DeleteSection />
    </div>
  );
};

export default ProjectSettingsPage;

function UpdateNameSection() {
  const { isLoading, isSuccess, data: project } = useProjectQuery();
  const { mutate: updateProjectName, isPending } = useUpdateProjectName();
  const form = useForm<UpdateProjectNameFormSchema>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(UpdateProjectNameFormSchema),
    disabled: isLoading || isPending,
  });

  useEffect(() => {
    if (isSuccess) form.reset({ name: project.name });
  }, [isSuccess, project, form]);

  const handleSubmit = form.handleSubmit(async (data) =>
    updateProjectName(data)
  );

  return (
    <SectionCard>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle>Name</SectionCardTitle>
            </SectionCardHeader>

            <SectionCardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCardContent>
          </SectionCardRow>
          <SectionCardFooter>
            <SectionCardFormActionButton />
          </SectionCardFooter>
        </form>
      </Form>
    </SectionCard>
  );
}

function UpdateImageSection() {
  const { isLoading, isSuccess, data: project } = useProjectQuery();
  const { mutate: updateProjectImage, isPending } = useUpdateProjectImage();
  const [image, setImage] = useState<FileWithPreview>();
  const form = useForm<UpdateProjectImageFormSchema>({
    defaultValues: {
      image: null,
    },
    resolver: zodResolver(UpdateProjectImageFormSchema),
    disabled: isLoading || isPending,
  });

  useEffect(() => {
    if (isSuccess && project.image && !form.getValues().image)
      setImage({
        file: new File([project.image.blob], project.name),
        id: project.name,
        preview: project.image.url,
      });
  }, [isSuccess, project, form]);

  const handleSubmit = form.handleSubmit(async (data) =>
    updateProjectImage(data)
  );

  return (
    <SectionCard>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle>Image</SectionCardTitle>
            </SectionCardHeader>

            <SectionCardContent>
              <FormField
                control={form.control}
                name="image"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <ImageInputField
                        {...field}
                        file={image}
                        onFileChange={(file) => {
                          setImage(file);
                          if (file?.file instanceof File)
                            form.setValue('image', file.file, {
                              shouldDirty: true,
                            });
                        }}
                        onGenerateRandomColor={(file) => {
                          setImage(file);
                          if (file?.file instanceof File)
                            form.setValue('image', file.file, {
                              shouldDirty: true,
                            });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCardContent>
          </SectionCardRow>
          <SectionCardFooter>
            <SectionCardFormActionButton />
          </SectionCardFooter>
        </form>
      </Form>
    </SectionCard>
  );
}
function DeleteSection() {
  const [open, setOpen] = useState(false);
  const { isLoading, isSuccess, data: project } = useProjectQuery();
  const projectId = useProjectParam();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const router = useRouter();

  const handleDelete = () => {
    deleteProject(projectId);
    setOpen(false);
    if (project?.workspaceId)
      router.replace(`/workspaces/${project.workspaceId}/projects`);
  };

  return (
    <SectionCard>
      <SectionCardRow>
        <SectionCardHeader>
          <SectionCardTitle>Delete</SectionCardTitle>
          <SectionCardDescription>
            After deleting project all associated tasks also will be removed
          </SectionCardDescription>
        </SectionCardHeader>

        <SectionCardContent>
          <Card>
            <CardContent className="flex items-center gap-4 p-3">
              {isLoading ? (
                <Skeleton size="box" className="size-8 rounded-full" />
              ) : (
                isSuccess && (
                  <Avatar className="size-8">
                    <AvatarImage src={project.image?.url} />
                    <AvatarFallback>{project.name.at(0)}</AvatarFallback>
                  </Avatar>
                )
              )}
              <span className="text-sm">
                {isLoading ? (
                  <Skeleton size="text" className="w-20" />
                ) : (
                  isSuccess && project.name
                )}
              </span>
            </CardContent>
          </Card>
        </SectionCardContent>
      </SectionCardRow>
      <SectionCardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isDeleting}>
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure want to delete {project?.name} project. after
                deleting this project all associated tasks will also be removed
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </SectionCardFooter>
    </SectionCard>
  );
}
