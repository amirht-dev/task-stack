import { UseQueryResult } from '@tanstack/react-query';
import { Models } from 'node-appwrite';
import useTasksQuery from './hooks/useTasksQuery';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export type DatabaseTask = Models.Row & {
  name: string;
  description: string | null;
  dueDate: string;
  status: TaskStatus;
  order: number;
  projectId: string;
  workspaceId: string;
  assigneeId: string;
};

export type Tasks = Awaited<
  ReturnType<typeof useTasksQuery> extends UseQueryResult<infer T> ? T : never
>;
