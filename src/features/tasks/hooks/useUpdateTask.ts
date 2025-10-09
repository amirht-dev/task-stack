import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskAction } from '../actions';
import { UpdateTaskFormSchema } from '../schemas';
import { getTasksQueryOptions } from './useTasksQuery';

function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-task'],
    mutationFn: async ({
      taskId,
      changes,
    }: {
      taskId: string;
      changes: UpdateTaskFormSchema;
    }) => {
      const res = await updateTaskAction(taskId, changes);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Updating task...',
        toastData: {
          id: 'update-task',
        },
      });

      return { toastId };
    },
    onSuccess(data, variables, onMutateResult) {
      sonner.success({
        title: 'Task updated',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
      queryClient.invalidateQueries(getTasksQueryOptions(data.projectId));
    },
    onError(error, variables, onMutateResult) {
      sonner.error({
        title: 'Failed to update task',
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useUpdateTask;
