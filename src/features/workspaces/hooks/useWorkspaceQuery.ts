import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceAction } from '../actions';
import { getWorkspacesQueryOptions } from './useWorkspacesQuery';

function getWorkspaceQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: ['workspaces', workspaceId],
    queryFn: async () => {
      const res = await getWorkspaceAction(workspaceId);

      if (!res.success) throw new Error(res.error);
      else
        return {
          ...res.data,
          imageUrl: res.data.imageBlob
            ? URL.createObjectURL(res.data.imageBlob)
            : null,
        };
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
          members: { memberships: [], total: workspaceData.totalMembers },
        };
    },
  });
}

export default useWorkspaceQuery;
