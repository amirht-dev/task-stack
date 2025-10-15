import { queryOptions, useQuery } from '@tanstack/react-query';
import { getWorkspaceAnalyticsAction } from '../actions';
import useWorkspaceParam from './useWorkspaceParam';

export function getWorkspaceAnalyticsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: ['workspace', workspaceId, 'analytics'],
    queryFn: async () => {
      const res = await getWorkspaceAnalyticsAction(workspaceId);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

function useWorkspaceAnalyticsQuery(workspaceId?: string) {
  const workspace_id = useWorkspaceParam();
  return useQuery(
    getWorkspaceAnalyticsQueryOptions(workspaceId ?? workspace_id)
  );
}

export default useWorkspaceAnalyticsQuery;
