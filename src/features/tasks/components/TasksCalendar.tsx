import {
  FullCalendar,
  FullCalendarCalendar,
  FullCalendarCurrentValue,
  FullCalendarNextMonthBtn,
  FullCalendarPrevMonthBtn,
} from '@/components/FullCalendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressCircle } from '@/components/ui/progress';
import useProjectParam from '@/features/projects/hooks/useProjectParam';
import { cn } from '@/lib/utils';
import { useDebounce } from '@uidotdev/usehooks';
import { isSameDay } from 'date-fns';
import { differenceWith } from 'lodash';
import { ComponentProps, useEffect, useState } from 'react';
import { taskStatusColorClassName } from '../constants';
import useTasksQuery from '../hooks/useTasksQuery';
import useUpdateTasks from '../hooks/useUpdateTasks';
import { Tasks } from '../types';
import EditTaskModal from './EditTaskModal';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import useAuth from '@/features/auth/hooks/useAuth';

function mapTasksToEvents(tasks: Tasks) {
  return tasks?.map((task) => ({
    id: task.$id,
    title: task.name,
    date: new Date(task.dueDate),
    task: task,
  }));
}

type TaskEvent = ReturnType<typeof mapTasksToEvents>[number];

const TasksCalendar = () => {
  const project_id = useProjectParam();
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    isSuccess: isSuccessTasks,
    isFetching: isFetchingTasks,
  } = useTasksQuery(project_id);
  const { mutate: updateTasks, isPending: isUpdatingTasks } = useUpdateTasks();
  const { data: project } = useProjectQuery();
  const { data: workspace } = useWorkspaceQuery();
  const { user } = useAuth();

  const isOwner =
    project?.ownerId === user?.$id || workspace?.userId === user?.$id;

  const [events, setEvents] = useState<TaskEvent[]>(() =>
    tasks ? mapTasksToEvents(tasks) : []
  );

  const debouncedEvents = useDebounce(events, 1500);

  useEffect(() => {
    if (!isSuccessTasks || isFetchingTasks) return;

    const changedTasks = differenceWith(
      debouncedEvents.map((event) => event.task),
      tasks,
      (a, b) => a.$id === b.$id && isSameDay(a.dueDate, b.dueDate)
    );

    if (!changedTasks.length) return;

    updateTasks(
      changedTasks.map((task) => ({
        taskId: task.$id,
        changes: { dueDate: task.dueDate },
      }))
    );
  }, [debouncedEvents, isSuccessTasks, tasks, updateTasks, isFetchingTasks]);

  useEffect(() => {
    if (isSuccessTasks) setEvents(mapTasksToEvents(tasks));
  }, [tasks, isSuccessTasks]);

  const handleEventsChange = async (events: TaskEvent[]) => {
    const updatedEventTasks = events.map((event) => ({
      ...event,
      task: {
        ...event.task,
        dueDate: event.date.toISOString(),
      },
    }));
    setEvents(updatedEventTasks);
  };

  if (isLoadingTasks)
    return <ProgressCircle size={100} value={25} className="animate-spin" />;

  if (isSuccessTasks)
    return (
      <Card>
        <FullCalendar>
          <CardHeader className="pb-2">
            <div className="flex max-md:flex-1 items-center justify-between gap-4">
              <FullCalendarPrevMonthBtn />
              <FullCalendarCurrentValue />
              <FullCalendarNextMonthBtn />
            </div>
          </CardHeader>
          <CardContent>
            <FullCalendarCalendar
              disablePast
              events={events}
              onEventsChange={handleEventsChange}
              renderEvent={(event) => (
                <CalendarEventTask key={event.id} task={event.task} />
              )}
              disabled={isUpdatingTasks}
              readonly={!isOwner}
            />
          </CardContent>
        </FullCalendar>
      </Card>
    );
};

function CalendarEventTask({
  task,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & { task: Tasks[number] }) {
  return (
    <EditTaskModal
      task={task}
      trigger={
        <div
          {...props}
          className={cn(
            taskStatusColorClassName[task.status],
            'p-1 text-xs text-nowrap text-ellipsis overflow-hidden rounded',
            props.className
          )}
        >
          {task.name}
        </div>
      }
    />
  );
}

export default TasksCalendar;
