import { Models } from 'node-appwrite';

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
