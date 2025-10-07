import DatePicker from '@/components/DatePicker';
import {
  ResponsibleModal,
  ResponsibleModalClose,
  ResponsibleModalContent,
  ResponsibleModalDescription,
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
import useProjectsQuery from '@/features/projects/hooks/useProjectsQuery';
import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import useWorkspacesQuery from '../../workspaces/hooks/useWorkspacesQuery';
import useCreateTask from '../hooks/useCreateTask';
import { CreateTaskFormSchema } from '../schemas';
import { TaskStatus } from '../types';

type WorkspaceFormDialogProps = {
  trigger: ReactNode;
  defaultWorkspaceId?: string;
  defaultProjectId?: string;
};

const CreateTaskModal = ({
  trigger,
  defaultWorkspaceId,
  defaultProjectId,
}: WorkspaceFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const workspaces = useWorkspacesQuery();
  const { selectedWorkspace } = useSelectWorkspace();
  const form = useForm<CreateTaskFormSchema>({
    defaultValues: {
      name: '',
      description: '',
      dueDate: '',
      status: TaskStatus.BACKLOG,
      workspaceId: defaultWorkspaceId ?? selectedWorkspace?.$id ?? '',
      projectId: defaultProjectId ?? '',
      order: 1,
    },
    resolver: zodResolver(CreateTaskFormSchema),
  });
  const workspaceId = form.watch('workspaceId');
  const projects = useProjectsQuery(workspaceId, { enabled: !!workspaceId });
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isCreatingTask) return;
    createTask(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  });

  return (
    <>
      <ResponsibleModal open={open} onOpenChange={setOpen}>
        <ResponsibleModalTrigger asChild>{trigger}</ResponsibleModalTrigger>
        <ResponsibleModalContent className="container overflow-hidden">
          <DevTool control={form.control} />
          <ResponsibleModalHeader>
            <ResponsibleModalTitle className="capitalize">
              Add New Task
            </ResponsibleModalTitle>
            <ResponsibleModalDescription className="sr-only">
              add new task
            </ResponsibleModalDescription>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description:</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Due Date:</FormLabel>
                    <FormControl>
                      <DatePicker
                        {...field}
                        value={value}
                        onValueChange={(date) => onChange(date.toISOString())}
                        onReset={() => form.resetField('dueDate')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status:</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TaskStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select workspace" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.data?.map((workspace) => (
                            <SelectItem
                              key={workspace.$id}
                              value={workspace.$id}
                            >
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
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project:</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!projects.isSuccess}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.data?.map((project) => (
                            <SelectItem key={project.$id} value={project.$id}>
                              <span className="flex items-center gap-2">
                                <Avatar className="size-5">
                                  {project.image && (
                                    <AvatarImage
                                      src={project.image.url}
                                      alt={project.name}
                                    />
                                  )}
                                </Avatar>
                                <span>{project.name}</span>
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
                  disabled={isCreatingTask}
                  asChild
                >
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isCreatingTask}
                  >
                    Cancel
                  </Button>
                </ResponsibleModalClose>

                <Button type="submit" disabled={isCreatingTask}>
                  Add Task
                </Button>
              </ResponsibleModalFooter>
            </form>
          </Form>
        </ResponsibleModalContent>
      </ResponsibleModal>
    </>
  );
};

export default CreateTaskModal;
