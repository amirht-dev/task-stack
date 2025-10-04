import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';
import { getProjectsAction } from '../actions';

export function getProjectsQueryOptions(workspaceId?: string) {
  return queryOptions({
    queryKey: ['workspace', workspaceId, 'projects'],
    queryFn: workspaceId
      ? async () => {
          const res = await getProjectsAction({ workspaceId });
          if (!res.success) throw new Error(res.error.message);

          return res.data.rows.map((row) => ({
            ...row,
            image: row.image
              ? { ...row.image, url: URL.createObjectURL(row.image?.blob) }
              : null,
          }));
        }
      : skipToken,
    enabled: !!workspaceId,
  });
}

function useProjectsQuery(workspaceId?: string) {
  const { selectedWorkspace } = useSelectWorkspace();

  return useQuery(
    getProjectsQueryOptions(workspaceId ?? selectedWorkspace?.$id)
  );
}

export default useProjectsQuery;
