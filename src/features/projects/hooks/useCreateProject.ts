import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectAction } from '../actions';
import { CreateProjectFormSchema } from '../schemas';
import { getProjectsQueryOptions } from './useProjectsQuery';

function useCreateProject() {
  const queryClient = useQueryClient();

  const { selectedWorkspace } = useSelectWorkspace();

  return useMutation({
    mutationKey: ['create-project'],
    mutationFn: async (project: CreateProjectFormSchema) => {
      const res = await createProjectAction(project);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Creating project...',
        toastData: { id: 'create-project' },
      });
      return { toastId };
    },
    onSuccess(_, __, onMutateResult) {
      sonner.success({
        title: 'Project created',
        toastData: { id: onMutateResult?.toastId },
      });
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryOptions(selectedWorkspace?.$id).queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      sonner.error({
        title: 'Failed to create Project',
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useCreateProject;
