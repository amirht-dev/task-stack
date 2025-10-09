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
    staleTime: 60 * 1000,
  });
}

function useProjectsQuery(
  workspaceId?: string,
  options?: Partial<ReturnType<typeof getProjectsQueryOptions>>
) {
  const { selectedWorkspace } = useSelectWorkspace();

  const id = workspaceId ?? selectedWorkspace?.$id;

  return useQuery({
    ...getProjectsQueryOptions(id),
    ...options,
  });
}

export default useProjectsQuery;
