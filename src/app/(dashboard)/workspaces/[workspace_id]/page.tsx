'use client';

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
import { ProgressCircle } from '@/components/ui/progress';
import useAuth from '@/features/auth/hooks/useAuth';
import {
  deleteWorkspaceAction,
  updateWorkspaceImageAction,
  updateWorkspaceNameAction,
} from '@/features/workspaces/actions';
import WorkspaceImageInput from '@/features/workspaces/components/WorkspaceImageInput';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { getWorkspacesQueryOptions } from '@/features/workspaces/hooks/useWorkspacesQuery';
import useWorkspaceUserRoles from '@/features/workspaces/hooks/useWorkspaceUserRoles';
import {
  WorkspaceImageFormUpdateSchema,
  WorkspaceNameFormUpdateSchema,
} from '@/features/workspaces/schemas';
import {
  formatAvatarFallback,
  formatMembersCount,
} from '@/features/workspaces/utils';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  use,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const WorkspaceContext = createContext<{ workspaceId: string } | null>(null);

const WorkspaceOverviewPage = ({
  params,
}: PageProps<'/workspaces/[workspace_id]'>) => {
  const { workspace_id } = use(params);
  const workspace = useWorkspaceQuery(workspace_id);
  const { isOwner } = useWorkspaceUserRoles(workspace_id);
  const { isAuthenticating } = useAuth();

  if (workspace.isLoading || isAuthenticating || isOwner === undefined)
    return (
      <div className="h-full flex items-center justify-center">
        <ProgressCircle
          value={25}
          size={100}
          strokeWidth={5}
          className="text-primary animate-spin"
        />
      </div>
    );

  if (isOwner)
    return (
      <WorkspaceContext.Provider value={{ workspaceId: workspace_id }}>
        <div className="relative space-y-6">
          <NameFormSectionCard />
          <ImageFormSectionCard />
          <DeleteWorkspaceSectionCard />
        </div>
      </WorkspaceContext.Provider>
    );

  if (workspace.isSuccess)
    return (
      <Card className="">
        <CardContent>
          <div className="flex items-center gap-8">
            <Avatar className="size-30">
              {workspace.data?.imageUrl && (
                <AvatarImage
                  src={workspace.data.imageUrl}
                  alt={workspace.data.name}
                />
              )}
              <AvatarFallback>
                {formatAvatarFallback(workspace.data.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <span className="text-2xl font-normal">
                {workspace.data.name}
              </span>
              <span className="text-muted-foreground text-sm">
                created by {workspace.data.user.name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

function NameFormSectionCard() {
  const { workspaceId } = useContext(WorkspaceContext)!;
  const queryClient = useQueryClient();
  const workspace = useWorkspaceQuery(workspaceId);
  const form = useForm({
    values: { name: workspace.data?.name ?? '' },
    resolver: zodResolver(
      WorkspaceNameFormUpdateSchema(workspace.data?.name ?? '')
    ),
    disabled: !workspace.isSuccess,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (workspace.data?.name === data.name) return;

    const id = toast.custom(
      () => <Toast variant="loading" title="Updating workspace name..." />,
      {
        id: 'update-workspace-name',
      }
    );

    const res = await updateWorkspaceNameAction(workspaceId, data);

    if (res.success) {
      toast.custom(
        () => <Toast variant="success" title="Workspace name updated" />,
        {
          id,
        }
      );
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
      form.reset({
        name: res.data.name,
      });
    } else {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to update workspace name"
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
                      <Input
                        {...field}
                        variant="lg"
                        placeholder="Enter workspace name"
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

function ImageFormSectionCard() {
  const { workspaceId } = useContext(WorkspaceContext)!;
  const workspace = useWorkspaceQuery(workspaceId);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<FileWithPreview>();
  const form = useForm({
    defaultValues: {
      image: null,
    },
    resolver: zodResolver(WorkspaceImageFormUpdateSchema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const id = toast.custom(
      () => <Toast variant="loading" title="Updating workspace image..." />,
      {
        id: 'update-workspace-image',
      }
    );

    const res = await updateWorkspaceImageAction(workspaceId, data);

    if (res.success) {
      toast.custom(
        () => <Toast variant="success" title="Workspace image updated" />,
        {
          id,
        }
      );
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryOptions().queryKey,
      });
    } else {
      toast.error(
        () => (
          <Toast
            variant="destructive"
            title="Failed to update workspace image"
            description={res.error.message}
          />
        ),
        {
          id,
        }
      );
    }
  });

  useEffect(() => {
    if (
      !file &&
      workspace.isSuccess &&
      workspace.data &&
      workspace.data.imageBlob &&
      workspace.data.imageUrl
    )
      setFile({
        file: new File([workspace.data.imageBlob], ''),
        id: '',
        preview: workspace.data.imageUrl,
      });
  }, [workspace, file]);

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
                      <WorkspaceImageInput
                        {...field}
                        file={file}
                        onFileChange={(file) => {
                          setFile(file);
                          if (file?.file instanceof File)
                            form.setValue('image', file.file, {
                              shouldDirty: true,
                            });
                        }}
                        onGenerateRandomColor={(file) => {
                          setFile(file);
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

function DeleteWorkspaceSectionCard() {
  const { workspaceId } = useContext(WorkspaceContext)!;
  const workspace = useWorkspaceQuery(workspaceId);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [pending, startTransition] = useTransition();

  const handleDelete = async () => {
    setOpen(false);
    startTransition(async () => {
      const id = toast.custom(
        () => <Toast variant="loading" title="Deleting workspace..." />,
        {
          id: 'delete-workspace',
        }
      );

      const res = await deleteWorkspaceAction(workspaceId);

      if (res.success) {
        toast.custom(
          () => <Toast variant="success" title="Workspace deleted" />,
          { id }
        );
        queryClient.invalidateQueries({
          queryKey: getWorkspacesQueryOptions().queryKey,
        });
        router.replace('/workspaces');
      } else {
        toast.custom(
          () => (
            <Toast
              variant="destructive"
              title="Failed to delete workspace"
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
    <SectionCard className="p-5">
      <SectionCardRow>
        <SectionCardHeader className="p-0">
          <SectionCardTitle>Delete workspace</SectionCardTitle>
          <SectionCardDescription>
            The workspace will be permanently deleted, including all data
            associated with this workspace. This action is irreversible.
          </SectionCardDescription>
        </SectionCardHeader>

        <SectionCardContent>
          <Card>
            <CardContent className="p-3">
              <div className="flex gap-3 items-center">
                <Avatar>
                  {workspace.data?.imageUrl && (
                    <AvatarImage src={workspace.data?.imageUrl} />
                  )}
                  <AvatarFallback>
                    {workspace.isSuccess &&
                      formatAvatarFallback(workspace.data.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="text-sm font-normal">
                    {workspace.data?.name}
                  </span>
                  <small className="text-xs text-muted-foreground">
                    {workspace.data?.members &&
                      formatMembersCount(workspace.data.members.total)}
                  </small>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionCardContent>
      </SectionCardRow>
      <SectionCardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={pending}>
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete workspace</AlertDialogTitle>
              <AlertDialogDescription>
                after deleting workspace you lose all data such as members and
                projects.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionCardFooter>
    </SectionCard>
  );
}

export default WorkspaceOverviewPage;
