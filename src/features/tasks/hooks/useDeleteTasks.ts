import useProjectParam from '@/features/projects/hooks/useProjectParam';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTasksAction } from '../actions';

function useDeleteTasks() {
  const queryClient = useQueryClient();
  const project_id = useProjectParam();
  return useMutation({
    mutationKey: ['delete-tasks'],
    mutationFn: async (taskIds: string[]) => {
      const res = await deleteTasksAction(taskIds);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate(taskIds) {
      const toastId = sonner.loading({
        title: `Deleting ${taskIds.length} tasks...`,
        toastData: { id: `delete-tasks` },
      });

      return { toastId };
    },
    onSuccess(data, variables, onMutateResult) {
      sonner.success({
        title: `All ${data.length} Tasks deleted`,
        toastData: { id: onMutateResult?.toastId },
      });
      queryClient.invalidateQueries({
        queryKey: ['project', project_id],
      });
    },
    onError(error, variables, onMutateResult) {
      sonner.error({
        title: `Failed to delete Tasks`,
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useDeleteTasks;
