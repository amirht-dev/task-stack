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
import {
  deleteWorkspaceAction,
  updateWorkspaceImageAction,
  updateWorkspaceNameAction,
} from '@/features/workspaces/actions';
import WorkspaceImageInput from '@/features/workspaces/components/WorkspaceImageInput';
import useWorkspace from '@/features/workspaces/hooks/useWorkspace';
import { getWorkspacesQueryOptions } from '@/features/workspaces/hooks/useWorkspacesQuery';
import {
  WorkspaceImageFormUpdateSchema,
  WorkspaceNameFormUpdateSchema,
} from '@/features/workspaces/schemas';
import { formatMembersCount } from '@/features/workspaces/utils';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { NextPage } from '@/types/next';
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

const WorkspacePage: NextPage<'workspace_id'> = ({ params }) => {
  const { workspace_id } = use(params);

  return (
    <WorkspaceContext.Provider value={{ workspaceId: workspace_id }}>
      <div className="relative space-y-6">
        <NameFormSectionCard />
        <ImageFormSectionCard />
        <DeleteWorkspaceSectionCard />
      </div>
    </WorkspaceContext.Provider>
  );
};

function NameFormSectionCard() {
  const { workspaceId } = useContext(WorkspaceContext)!;
  const queryClient = useQueryClient();
  const workspace = useWorkspace(workspaceId);
  const form = useForm({
    values: { name: workspace.data?.name ?? '' },
    resolver: zodResolver(
      WorkspaceNameFormUpdateSchema(workspace.data?.name ?? '')
    ),
    disabled: !workspace.isSuccess,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (workspace.data?.name === data.name) return;

    const id = toast.loading('updating workspace name...', {
      description: '',
      id: 'update-workspace-name',
    });

    const res = await updateWorkspaceNameAction(workspaceId, data);

    if (res.success) {
      toast.success(<strong>Workspace name updated</strong>, {
        id,
        description: (
          <>
            name of <strong>{workspace.data?.name}</strong> workspace updated to{' '}
            <strong>{res.data.name}</strong>
          </>
        ),
      });
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryOptions().queryKey,
      });
      form.reset({
        name: res.data.name,
      });
    } else {
      toast.error(<strong>Failed to update workspace name</strong>, {
        id,
        description: res.error,
      });
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
  const workspace = useWorkspace(workspaceId);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<FileWithPreview>();
  const form = useForm({
    defaultValues: {
      image: null,
    },
    resolver: zodResolver(WorkspaceImageFormUpdateSchema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const id = toast.loading('updating workspace image...', {
      description: '',
      id: 'update-workspace-image',
    });

    const res = await updateWorkspaceImageAction(workspaceId, data);

    if (res.success) {
      toast.success(<strong>Workspace image updated</strong>, {
        id,
        description: '',
      });
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryOptions().queryKey,
      });
    } else {
      toast.error(<strong>Failed to update workspace image</strong>, {
        id,
        description: res.error,
      });
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
  const workspace = useWorkspace(workspaceId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      const id = toast.loading('Deleting workspace...', {
        id: 'delete-workspace',
      });

      const res = await deleteWorkspaceAction(workspaceId);

      if (res.success) {
        toast.success('Workspace deleted', { id });
        queryClient.invalidateQueries({
          queryKey: getWorkspacesQueryOptions().queryKey,
        });
        router.replace('/workspaces');
      } else {
        toast.error('Failed to delete workspace', { id });
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
                    {workspace.data?.name
                      .split(' ')
                      .map((work) => work.at(0))
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="text-sm font-normal">
                    {workspace.data?.name}
                  </span>
                  <small className="text-xs text-muted-foreground">
                    {workspace.data?.members &&
                      formatMembersCount(workspace.data.members)}
                  </small>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionCardContent>
      </SectionCardRow>
      <SectionCardFooter>
        <Button variant="destructive" disabled={pending} onClick={handleDelete}>
          Delete
        </Button>
      </SectionCardFooter>
    </SectionCard>
  );
}

export default WorkspacePage;
