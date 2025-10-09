import { NotFoundException } from '@/utils/exceptions';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectAction } from '../actions';
import useProjectParam from './useProjectParam';
import { getProjectsQueryOptions } from './useProjectsQuery';

export function getProjectQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await getProjectAction(projectId);
      if (!res.success && res.error.type === 'row_not_found')
        throw new NotFoundException(res.error.message);
      if (!res.success) throw new Error(res.error.message);
      return {
        ...res.data,
        image: res.data.image
          ? { ...res.data.image, url: URL.createObjectURL(res.data.image.blob) }
          : null,
      };
    },
    retry(_, error) {
      return error instanceof NotFoundException ? false : true;
    },
    staleTime: 60 * 1000,
  });
}

function useProjectQuery(projectId?: string) {
  const project_id = useProjectParam();
  const id = projectId ?? project_id;
  if (!id)
    throw new Error(
      'you must either pass projectId or use it in dynamic project_id page'
    );
  const queryClient = useQueryClient();
  return useQuery({
    ...getProjectQueryOptions(id),
    initialData: () =>
      queryClient
        .getQueryData(getProjectsQueryOptions().queryKey)
        ?.find((project) => project.$id === projectId),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(getProjectsQueryOptions().queryKey)
        ?.dataUpdatedAt,
  });
}

export default useProjectQuery;
