import { NotFoundException } from '@/utils/exceptions';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { getWorkspaceAction } from '../actions';

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
          image: res.data.image
            ? {
                ...res.data.image,
                url: URL.createObjectURL(res.data.image.blob),
              }
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
  // const queryClient = useQueryClient();

  return useQuery({
    ...getWorkspaceQueryOptions(workspaceId),
    // placeholderData: () => {
    //   const workspaceData = queryClient
    //     .getQueryData(getWorkspacesQueryOptions().queryKey)
    //     ?.find((workspace) => workspace.$id === workspaceId);

    //   if (workspaceData)
    //     return {
    //       ...workspaceData,
    //       user: { name: '' },
    //     };
    // },
  });
}

export default useWorkspaceQuery;
