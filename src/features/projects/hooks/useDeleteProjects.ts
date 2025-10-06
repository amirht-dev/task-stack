import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectsAction } from '../actions';
import { getProjectQueryOptions } from './useProjectQuery';
import { getProjectsQueryOptions } from './useProjectsQuery';

function useDeleteProjects() {
  const queryClient = useQueryClient();
  const workspace_id = useWorkspaceParam();

  return useMutation({
    mutationKey: ['delete-project'],
    mutationFn: async (projectIds: string[]) => {
      const res = await deleteProjectsAction(projectIds);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onMutate(projectId) {
      const toastId = sonner.loading({
        title: 'Deleting project...',
        toastData: { id: `delete-project-${projectId}` },
      });

      return { toastId };
    },
    onSuccess(projects, __, onMutateResult) {
      sonner.success({
        title: 'Project deleted',
        toastData: { id: onMutateResult?.toastId },
      });
      projects.forEach((project) =>
        queryClient.removeQueries({
          queryKey: getProjectQueryOptions(project.$id).queryKey,
        })
      );
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryOptions(workspace_id).queryKey,
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

export default useDeleteProjects;
