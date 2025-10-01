import { NotFoundException } from '@/utils/exceptions';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceAction } from '../actions';
import { getWorkspacesQueryOptions } from './useWorkspacesQuery';

export function getWorkspaceQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: ['workspaces', workspaceId],
    queryFn: async () => {
      const res = await getWorkspaceAction(workspaceId);

      if (!res.success) {
        if (res.error.type === 'row_not_found')
          throw new NotFoundException(res.error.message);
        throw new Error(res.error.message);
      } else
        return {
          ...res.data,
          imageUrl: res.data.imageBlob
            ? URL.createObjectURL(res.data.imageBlob)
            : null,
        };
    },
    retry(failureCount, error) {
      if (error instanceof NotFoundException) return false;
      return failureCount < 3;
    },
  });
}

function useWorkspaceQuery(workspaceId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    ...getWorkspaceQueryOptions(workspaceId),
    placeholderData: () => {
      const workspaceData = queryClient
        .getQueryData(getWorkspacesQueryOptions().queryKey)
        ?.rows.find((workspace) => workspace.$id === workspaceId);

      if (workspaceData)
        return {
          ...workspaceData,
          user: { name: '' },
          members: { memberships: [], total: workspaceData.totalMembers },
        };
    },
  });
}

export default useWorkspaceQuery;
