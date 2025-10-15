import useProjectParam from '@/features/projects/hooks/useProjectParam';
import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTaskAction } from '../actions';

function useDeleteTask() {
  const queryClient = useQueryClient();

  const project_id = useProjectParam();
  const workspace_id = useWorkspaceParam();

  return useMutation({
    mutationKey: ['delete-task'],
    mutationFn: async (taskId: string) => {
      const res = await deleteTaskAction(taskId);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate(taskId) {
      const toastId = sonner.loading({
        title: 'Deleting task...',
        toastData: { id: `delete-task-${taskId}` },
      });

      return { toastId };
    },
    onSuccess(data, variables, onMutateResult) {
      sonner.success({
        title: 'Task deleted',
        toastData: { id: onMutateResult?.toastId },
      });
      queryClient.invalidateQueries({
        queryKey: ['project', project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspace_id, 'analytics'],
      });
    },
    onError(error, variables, onMutateResult) {
      sonner.error({
        title: 'Failed to delete Task',
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useDeleteTask;
