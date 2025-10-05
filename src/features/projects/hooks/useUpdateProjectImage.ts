import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectImageAction } from '../actions';
import { UpdateProjectImageFormSchema } from '../schemas';
import useProjectParam from './useProjectParam';
import { getProjectQueryOptions } from './useProjectQuery';
import { getProjectsQueryOptions } from './useProjectsQuery';

function useUpdateProjectImage(projectId?: string) {
  const project_Id = useProjectParam();
  const queryClient = useQueryClient();

  const id = projectId ?? project_Id;

  return useMutation({
    mutationKey: ['update-project-image', id],
    mutationFn: async (data: UpdateProjectImageFormSchema) => {
      const res = await updateProjectImageAction(id, data);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Updating project image...',
        toastData: { id: `update-project-${id}-image` },
      });

      return { toastId };
    },
    onSuccess(data, _, onMutateResult) {
      sonner.success({
        title: 'Project image updated',
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
        title: 'Failed to update Project image',
        description: error.message,
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
  });
}

export default useUpdateProjectImage;
