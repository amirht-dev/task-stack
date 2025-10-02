import { queryOptions, useQuery } from '@tanstack/react-query';
import { getWorkspacesAction } from '../actions';

export const getWorkspacesQueryOptions = () => {
  return queryOptions({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await getWorkspacesAction();
      if (!res.success) throw new Error(res.error.message);

      return res.data.map((row) => ({
        ...row,
        image: row.image
          ? {
              id: row.image.id,
              url: URL.createObjectURL(row.image.blob),
              blob: row.image.blob,
            }
          : null,
      }));
    },
    staleTime: Infinity,
  });
};

const useWorkspacesQuery = () => {
  return useQuery(getWorkspacesQueryOptions());
};

export default useWorkspacesQuery;
