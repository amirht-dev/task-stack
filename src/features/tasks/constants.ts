import { TaskStatus } from './types';

export const taskStatusColorClassName: Record<TaskStatus, string> = {
  BACKLOG:
    'dark:bg-slate-800/50 dark:border-slate-400 dark:dark:text-slate-400 bg-slate-300/30 text-slate-700 border-slate-700',
  TODO: 'dark:bg-indigo-800/50 dark:border-indigo-400 dark:dark:text-indigo-400 bg-indigo-300/30 text-indigo-700 border-indigo-700',
  IN_PROGRESS:
    'dark:bg-teal-800/50 dark:border-teal-400 dark:dark:text-teal-400 bg-teal-300/30 text-teal-700 border-teal-700',
  IN_REVIEW:
    'dark:bg-rose-800/50 dark:border-rose-400 dark:dark:text-rose-400 bg-rose-300/30 text-rose-700 border-rose-700',
  DONE: 'dark:bg-green-800/50 dark:border-green-400 dark:text-green-400 bg-green-300/30 text-green-700 border-green-700',
};

export const taskStatusLabelMap: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'Review',
  DONE: 'Done',
};
