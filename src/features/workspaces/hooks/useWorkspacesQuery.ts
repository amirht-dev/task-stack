import { WorkspaceWithImageUrl } from '@/lib/appwrite/appwrite';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { Models } from 'node-appwrite';
import { getWorkspacesAction } from '../actions';

export const getWorkspacesQueryOptions = () => {
  return queryOptions({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await getWorkspacesAction();
      if (!res.success) throw new Error(res.error);

      const rowsWithImageUrl = res.data.rows.map<WorkspaceWithImageUrl>(
        (row) => ({
          ...row,
          imageUrl: row.imageBlob ? URL.createObjectURL(row.imageBlob) : null,
        })
      );

      return <Models.RowList<WorkspaceWithImageUrl>>{
        ...res.data,
        rows: rowsWithImageUrl,
      };
    },
    staleTime: Infinity,
  });
};

function useWorkspacesQuery() {
  const query = useQuery(getWorkspacesQueryOptions());

  return query;
}

export default useWorkspacesQuery;
