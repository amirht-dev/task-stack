import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectAction } from '../actions';
import { getProjectsQueryOptions } from './useProjectsQuery';

export function getProjectQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await getProjectAction(projectId);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}

function useProjectQuery(projectId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    ...getProjectQueryOptions(projectId),
    initialData: () =>
      queryClient
        .getQueryData(getProjectsQueryOptions().queryKey)
        ?.find((project) => project.$id === projectId),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(getProjectsQueryOptions().queryKey)
        ?.dataUpdatedAt,
  });
}

export default useProjectQuery;
