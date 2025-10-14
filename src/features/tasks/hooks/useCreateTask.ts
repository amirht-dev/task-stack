import useProjectParam from '@/features/projects/hooks/useProjectParam';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTaskAction } from '../actions';
import { CreateTaskFormSchema } from '../schemas';
import { getTasksQueryOptions } from './useTasksQuery';

function useCreateTask() {
  const queryClient = useQueryClient();
  const project_id = useProjectParam();
  return useMutation({
    mutationKey: ['create-task'],
    mutationFn: async (data: CreateTaskFormSchema) => {
      const res = await createTaskAction(data);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate(variables) {
      const toastId = sonner.loading({
        title: 'Creating task...',
        toastData: {
          id: `create-task-${variables.name}`,
        },
      });

      return { toastId };
    },
    onSuccess(data, variables, onMutateResult) {
      sonner.success({
        title: 'Task created',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
      queryClient.invalidateQueries({
        queryKey: ['project', project_id],
      });
    },
    onError(error, variables, onMutateResult) {
      sonner.error({
        title: 'Failed to create Task',
        description: error.message,
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
  });
}

export default useCreateTask;
