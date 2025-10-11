import { TaskStatus } from './types';

export const taskStatusColorClassName: Record<TaskStatus, string> = {
  BACKLOG:
    'dark:bg-slate-800/50 dark:border-slate-400 dark:dark:text-slate-400',
  TODO: 'dark:bg-indigo-800/50 dark:border-indigo-400 dark:dark:text-indigo-400',
  IN_PROGRESS:
    'dark:bg-teal-800/50 dark:border-teal-400 dark:dark:text-teal-400',
  IN_REVIEW: 'dark:bg-rose-800/50 dark:border-rose-400 dark:dark:text-rose-400',
  DONE: 'dark:bg-green-800/50 dark:border-green-400 dark:text-green-400',
};
