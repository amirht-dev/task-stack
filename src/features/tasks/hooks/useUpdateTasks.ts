import useProjectParam from '@/features/projects/hooks/useProjectParam';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskAction } from '../actions';
import { UpdateTaskFormSchema } from '../schemas';
import { getTasksQueryOptions } from './useTasksQuery';

function useUpdateTasks() {
  const queryClient = useQueryClient();
  const project_id = useProjectParam();
  return useMutation({
    mutationKey: ['update-tasks'],
    mutationFn: async (
      updates: {
        taskId: string;
        changes: UpdateTaskFormSchema;
      }[]
    ) => {
      const res = await Promise.all(
        updates.map(async ({ taskId, changes }) => {
          const res = await updateTaskAction(taskId, changes);
          if (!res.success) throw new Error(res.error.message);
          return res.data;
        })
      );

      return res;
    },
    async onMutate() {
      await queryClient.cancelQueries({
        queryKey: getTasksQueryOptions(project_id).queryKey,
      });
      const toastId = sonner.loading({
        title: 'Updating tasks...',
        toastData: {
          id: 'update-tasks',
        },
      });

      return { toastId };
    },
    async onSuccess(data, variables, onMutateResult) {
      sonner.success({
        title: 'Tasks updated',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
      await queryClient.invalidateQueries({
        queryKey: getTasksQueryOptions(project_id).queryKey,
      });
    },
    onError(error, variables, onMutateResult) {
      sonner.error({
        title: 'Failed to update tasks',
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useUpdateTasks;
