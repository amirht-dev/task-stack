import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectAction } from '../actions';
import useProjectParam from './useProjectParam';
import useProjectQuery, { getProjectQueryOptions } from './useProjectQuery';
import { getProjectsQueryOptions } from './useProjectsQuery';

function useDeleteProject() {
  const project_id = useProjectParam();
  const project = useProjectQuery(project_id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delete-project'],
    mutationFn: async (projectId?: string) => {
      const id = projectId ?? project_id;
      const res = await deleteProjectAction(id);
      if (!res.success) throw new Error(res.error.message);
      return id;
    },
    onMutate(projectId) {
      const toastId = sonner.loading({
        title: 'Deleting project...',
        toastData: { id: `delete-project-${projectId}` },
      });

      return { toastId };
    },
    onSuccess(projectId, __, onMutateResult) {
      sonner.success({
        title: 'Project deleted',
        toastData: { id: onMutateResult?.toastId },
      });
      queryClient.removeQueries({
        queryKey: getProjectQueryOptions(projectId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryOptions(project.data?.workspaceId).queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      sonner.error({
        title: 'Failed to delete Project',
        description: error.message,
        toastData: { id: onMutateResult?.toastId },
      });
    },
  });
}

export default useDeleteProject;
