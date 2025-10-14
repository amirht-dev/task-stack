import { queryOptions, useQuery } from '@tanstack/react-query';
import { getProjectAnalyticsAction } from '../actions';
import useProjectParam from './useProjectParam';

function getProjectAnalyticsQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['project', projectId, 'analytics'],
    queryFn: async () => {
      const res = await getProjectAnalyticsAction(projectId);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

function useProjectAnalyticsQuery(projectId?: string) {
  const project_id = useProjectParam();
  return useQuery(getProjectAnalyticsQueryOptions(projectId ?? project_id));
}

export default useProjectAnalyticsQuery;
