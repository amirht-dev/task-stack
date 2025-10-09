'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Skeleton } from '@/components/ui/skeleton';
import useProjectParam from '@/features/projects/hooks/useProjectParam';
import { differenceWith, mapValues } from 'lodash';
import { GripVertical } from 'lucide-react';
import * as React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaArrowsRotate } from 'react-icons/fa6';
import { IoSaveOutline } from 'react-icons/io5';
import { twJoin } from 'tailwind-merge';
import { Entries, Merge } from 'type-fest';
import useTasksQuery from '../hooks/useTasksQuery';
import useUpdateTask from '../hooks/useUpdateTask';
import { Tasks, TaskStatus } from '../types';
import { groupTasksByStatus } from '../utils';
import TaskActions from './TaskActions';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'Review',
  DONE: 'Done',
};

interface TaskCardProps
  extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  task: Tasks[number];
  asHandle?: boolean;
}

function TaskCard({ task, asHandle, ...props }: TaskCardProps) {
  const [show, setShow] = React.useState(false);

  const desc = task.description ?? '';

  const cardContent = (
    <div className="rounded-md border bg-card p-3 shadow-xs flex flex-col min-h-[122px]">
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-medium text-sm">{task.name}</span>
          <TaskActions
            task={task}
            trigger={
              <Button variant="ghost" size="icon" className="size-6">
                <BsThreeDotsVertical className="size-3" />
              </Button>
            }
          />
        </div>
        <p className="text-xs text-muted-foreground" title={desc}>
          {desc?.length > 40 ? desc?.substring(0, show ? Infinity : 40) : desc}{' '}
          {!show && desc?.length > 40 && '...'}
          {desc?.length > 40 && (
            <Button
              mode="link"
              className="text-primary text-xs"
              onClick={() => setShow((p) => !p)}
            >
              show {show ? 'less' : 'more'}
            </Button>
          )}
          {/* {task.description} */}
        </p>

        <div className="flex items-center mt-auto justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-1 min-w-0">
            <Avatar className="size-5">
              <AvatarImage src={task.assignee?.avatar?.url} />
              <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span
              className="line-clamp-1 text-nowrap shrink-0 min-w-0 text-ellipsis flex-1"
              title={task.assignee.name}
            >
              {task.assignee.name}
            </span>
          </div>
          <time className="text-[10px] tabular-nums whitespace-nowrap shrink-0">
            {new Date(task.dueDate).toLocaleDateString()}
          </time>
        </div>
      </div>
    </div>
  );

  return (
    <KanbanItem value={task.$id} {...props}>
      {asHandle ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}

type TaskColumnProps = Merge<
  Omit<React.ComponentProps<typeof KanbanColumn>, 'children'>,
  {
    tasks: Tasks;
    isOverlay?: boolean;
    value: TaskStatus;
    draggable?: boolean;
    isLoading?: boolean;
  }
>;

function TaskColumn({
  value,
  tasks,
  draggable = false,
  isOverlay,
  isLoading = false,
  ...props
}: TaskColumnProps) {
  return (
    <KanbanColumn
      value={value}
      {...props}
      className="rounded-md border bg-card p-2.5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm">{COLUMN_TITLES[value]}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        {draggable && (
          <KanbanColumnHandle asChild>
            <Button variant="dim" size="sm" mode="icon">
              <GripVertical />
            </Button>
          </KanbanColumnHandle>
        )}
      </div>
      <KanbanColumnContent
        value={value}
        className="flex flex-col gap-2.5 p-0.5"
      >
        {isLoading
          ? Array.from({ length: 2 }, (_, idx) => (
              <Skeleton key={idx} size="box" className="w-full h-19" />
            ))
          : tasks
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <TaskCard key={task.$id} task={task} asHandle={!isOverlay} />
              ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export default function TasksKanban() {
  const project_id = useProjectParam();
  const {
    data: tasks,
    refetch: refetchTasks,
    isLoading: isTasksLoading,
    isSuccess: isTasksSuccess,
    isFetching: isTasksFetching,
  } = useTasksQuery(project_id);
  const [columns, setColumns] = React.useState<Record<TaskStatus, Tasks>>(() =>
    groupTasksByStatus(tasks ?? [])
  );
  const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();

  React.useEffect(() => {
    if (isTasksSuccess) setColumns(groupTasksByStatus(tasks));
  }, [tasks, isTasksSuccess]);

  const handleValueChange = React.useCallback(
    (value: Record<TaskStatus, Tasks>) => {
      if (!tasks) return;

      const updatedColumns = mapValues(value, (tasks, status) => {
        return tasks.map((task, idx) => ({
          ...task,
          status: status as TaskStatus,
          order: idx + 1,
        }));
      });

      setColumns(updatedColumns);
    },
    [tasks]
  );

  const changedTasks = React.useMemo(() => {
    if (!isTasksSuccess) return;

    return differenceWith(
      Object.values(columns).flat(),
      tasks,
      (a, b) => a.$id === b.$id && a.status === b.status && a.order === b.order
    );
  }, [columns, tasks, isTasksSuccess]);

  const handleSaveChanges = () => {
    if (!changedTasks?.length) return;

    changedTasks.forEach((task) => {
      updateTask({
        taskId: task.$id,
        changes: {
          status: task.status,
          order: task.order,
        },
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Tasks</CardTitle>
          <Button variant="dim" onClick={() => refetchTasks()}>
            <FaArrowsRotate
              className={twJoin('size-3', isTasksFetching && 'animate-spin')}
            />
            <span>refresh</span>
          </Button>
        </div>
        <CardToolbar>
          {!!changedTasks?.length && !isTasksFetching && (
            <Button onClick={handleSaveChanges} disabled={isUpdatingTask}>
              <IoSaveOutline />
              <span className="max-md:hidden">save changes</span>
            </Button>
          )}
        </CardToolbar>
      </CardHeader>
      <CardContent>
        <Kanban
          value={columns}
          onValueChange={handleValueChange}
          getItemValue={(item) => item.$id}
        >
          <KanbanBoard className="grid max-sm:items-start auto-rows-auto sm:auto-rows-fr sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(Object.entries(columns) as Entries<typeof columns>).map(
              ([columnValue, tasks]) => (
                <TaskColumn
                  key={columnValue}
                  isLoading={isTasksLoading}
                  value={columnValue}
                  tasks={tasks}
                />
              )
            )}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === 'column') {
                const tasks = columns[value as TaskStatus];
                return (
                  <TaskColumn
                    value={value.toString() as TaskStatus}
                    tasks={tasks}
                    isOverlay
                  />
                );
              }

              const task = Object.values(columns)
                .flat()
                .find((task) => task.$id === value);

              if (!task) return null;

              return <TaskCard task={task} />;
            }}
          </KanbanOverlay>
        </Kanban>
      </CardContent>
    </Card>
  );
}
