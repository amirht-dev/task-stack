import { Tasks, TaskStatus } from './types';

export const defaultKanbanValue: Record<TaskStatus, Tasks> = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  IN_REVIEW: [],
  DONE: [],
};

export function groupTasksByStatus(tasks: Tasks) {
  const statusGrouped = Object.groupBy(tasks, (task) => task.status);

  const columns: Record<TaskStatus, Tasks> = {
    BACKLOG: statusGrouped.BACKLOG ?? defaultKanbanValue.BACKLOG,
    TODO: statusGrouped.TODO ?? defaultKanbanValue.TODO,
    IN_PROGRESS: statusGrouped.IN_PROGRESS ?? defaultKanbanValue.IN_PROGRESS,
    IN_REVIEW: statusGrouped.IN_REVIEW ?? defaultKanbanValue.IN_REVIEW,
    DONE: statusGrouped.DONE ?? defaultKanbanValue.DONE,
  };

  return columns;
}
