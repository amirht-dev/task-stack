import { queryOptions, useQuery } from '@tanstack/react-query';
import { getWorkspacesAction } from '../actions';

export const getWorkspacesQueryOptions = () => {
  return queryOptions({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await getWorkspacesAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
};

function useWorkspacesQuery() {
  const query = useQuery(getWorkspacesQueryOptions());

  return query;
}

export default useWorkspacesQuery;
