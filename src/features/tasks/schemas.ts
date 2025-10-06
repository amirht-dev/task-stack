import { z } from 'zod/v4';
import { TaskStatus } from './types';

export const CreateTaskFormSchema = z.object({
  name: z.string().trim().min(4, 'task name must be at least 4 characters'),
  description: z.string(),
  dueDate: z.iso.datetime(),
  status: z.enum(TaskStatus),
  order: z.number().min(1, 'minimum number of order must be 1').optional(),
  projectId: z.string().trim(),
  workspaceId: z.string().trim(),
});
export type CreateTaskFormSchema = z.infer<typeof CreateTaskFormSchema>;
