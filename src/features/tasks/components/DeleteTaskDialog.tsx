'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReactNode } from 'react';
import useDeleteTask from '../hooks/useDeleteTask';
import useDeleteTasks from '../hooks/useDeleteTasks';
import { Tasks } from '../types';

function DeleteTaskDialog({
  trigger,
  tasks,
  onRemove,
}: {
  trigger: ReactNode;
  tasks: Tasks[number] | Tasks;
  onRemove?: () => void;
}) {
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: deleteTasks } = useDeleteTasks();

  const handleRemoveProject = async () => {
    onRemove?.();
    if (Array.isArray(tasks)) deleteTasks(tasks.map((project) => project.$id));
    else deleteTask(tasks.$id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {Array.isArray(tasks)
              ? `Delete all ${tasks.length} tasks?`
              : `Delete ${tasks.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            {Array.isArray(tasks) ? `all ${tasks.length} tasks` : tasks.name}{' '}
            from this project?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleRemoveProject}
          >
            {Array.isArray(tasks) ? 'Delete All' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTaskDialog;
