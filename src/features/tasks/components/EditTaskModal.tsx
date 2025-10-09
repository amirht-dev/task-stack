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
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import useUpdateTask from '../hooks/useUpdateTask';
import { UpdateTaskFormSchema } from '../schemas';
import { Tasks, TaskStatus } from '../types';

type WorkspaceFormDialogProps = {
  trigger: ReactNode;
  task: Tasks[number];
};

const EditTaskModal = ({ trigger, task }: WorkspaceFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateTaskFormSchema>({
    defaultValues: {
      name: task.name,
      description: task.description ?? '',
      dueDate: new Date(task.dueDate).toISOString(),
      status: task.status,
      order: task.order,
    },
    resolver: zodResolver(UpdateTaskFormSchema),
  });
  const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isUpdatingTask) return;
    updateTask(
      { taskId: task.$id, changes: data },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  });

  return (
    <>
      <ResponsibleModal open={open} onOpenChange={setOpen}>
        <ResponsibleModalTrigger asChild>{trigger}</ResponsibleModalTrigger>
        <ResponsibleModalContent className="container">
          <DevTool control={form.control} />
          <ResponsibleModalHeader>
            <ResponsibleModalTitle className="capitalize">
              Edit Task
            </ResponsibleModalTitle>
            <ResponsibleModalDescription className="sr-only">
              Edit {task.name} Task
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

              <ResponsibleModalFooter>
                <ResponsibleModalClose
                  onClick={() => form.reset()}
                  disabled={isUpdatingTask}
                  asChild
                >
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUpdatingTask}
                  >
                    Cancel
                  </Button>
                </ResponsibleModalClose>

                <Button
                  type="submit"
                  disabled={isUpdatingTask || !form.formState.isDirty}
                >
                  Edit Task
                </Button>
              </ResponsibleModalFooter>
            </form>
          </Form>
        </ResponsibleModalContent>
      </ResponsibleModal>
    </>
  );
};

export default EditTaskModal;
