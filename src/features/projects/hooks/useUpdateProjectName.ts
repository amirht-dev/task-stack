import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectNameAction } from '../actions';
import { UpdateProjectNameFormSchema } from '../schemas';
import useProjectParam from './useProjectParam';
import { getProjectQueryOptions } from './useProjectQuery';
import { getProjectsQueryOptions } from './useProjectsQuery';

function useUpdateProjectName(projectId?: string) {
  const project_Id = useProjectParam();
  const queryClient = useQueryClient();

  const id = projectId ?? project_Id;

  return useMutation({
    mutationKey: ['update-project-name', id],
    mutationFn: async (data: UpdateProjectNameFormSchema) => {
      const res = await updateProjectNameAction(id, data);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Updating project name...',
        toastData: { id: `update-project-${id}-name` },
      });

      return { toastId };
    },
    onSuccess(data, _, onMutateResult) {
      sonner.success({
        title: 'Project name updated',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getProjectQueryOptions(id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryOptions(data.workspaceId).queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      sonner.error({
        title: 'Failed to update Project name',
        description: error.message,
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
  });
}

export default useUpdateProjectName;
