import { queryOptions, useQuery } from '@tanstack/react-query';
import { getTasksAction } from '../actions';

export function getTasksQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: async () => {
      const res = await getTasksAction(projectId);
      if (!res.success) throw new Error(res.error.message);

      return res.data.map((task) => ({
        ...task,
        assignee: {
          ...task.assignee,
          avatar: task.assignee.avatar
            ? {
                ...task.assignee.avatar,
                url: URL.createObjectURL(task.assignee.avatar.blob),
              }
            : null,
        },
      }));
    },
    staleTime: 60 * 1000,
  });
}

function useTasksQuery(
  projectId: string,
  options?: ReturnType<typeof getTasksQueryOptions>
) {
  return useQuery({
    ...getTasksQueryOptions(projectId),
    ...options,
  });
}

export default useTasksQuery;
