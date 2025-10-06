import sonner from '@/utils/toast';
import { useMutation } from '@tanstack/react-query';
import { createTaskAction } from '../actions';
import { CreateTaskFormSchema } from '../schemas';

function useCreateTask() {
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
    onSuccess(data, variables, onMutateResult, context) {
      sonner.success({
        title: 'Task created',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
    onError(error, variables, onMutateResult, context) {
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
