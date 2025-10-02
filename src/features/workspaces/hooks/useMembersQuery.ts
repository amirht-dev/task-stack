import { queryOptions, useQuery } from '@tanstack/react-query';
import { getWorkspaceAction, getWorkspaceMembersAction } from '../actions';
import { getWorkspaceQueryOptions } from './useWorkspaceQuery';

export const getMembersQueryOptions = ({
  workspaceId,
  teamId,
}: {
  workspaceId: string;
  teamId?: string;
}) => {
  return queryOptions({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: async ({ client }) => {
      let _teamId: string | null = null;
      if (teamId) _teamId = teamId;
      else {
        const cachedWorkspace = client.getQueryData(
          getWorkspaceQueryOptions(workspaceId).queryKey
        );
        if (cachedWorkspace) _teamId = cachedWorkspace.teamId;
        else {
          const res = await getWorkspaceAction(workspaceId);
          if (!res.success) throw new Error(res.error.message);
          _teamId = res.data.teamId;
        }
      }
      if (!_teamId) throw new Error('missing teamId');

      const res = await getWorkspaceMembersAction(_teamId);

      if (!res.success) throw new Error(res.error.message);

      return res.data;
    },
  });
};

function useMembersQuery(...args: Parameters<typeof getMembersQueryOptions>) {
  return useQuery(getMembersQueryOptions(...args));
}

export default useMembersQuery;
