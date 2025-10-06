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
import useDeleteProject from '../hooks/useDeleteProject';
import useDeleteProjects from '../hooks/useDeleteProjects';
import { Projects } from '../types';

function RemoveProjectDialog({
  trigger,
  projects,
  onRemove,
}: {
  trigger: ReactNode;
  projects: Projects[number] | Projects;
  onRemove?: () => void;
}) {
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: deleteProjects } = useDeleteProjects();

  const handleRemoveProject = async () => {
    onRemove?.();
    if (Array.isArray(projects))
      deleteProjects(projects.map((project) => project.$id));
    else deleteProject(projects.$id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {Array.isArray(projects)
              ? `Remove all ${projects.length} projects?`
              : `Remove ${projects.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{' '}
            {Array.isArray(projects)
              ? `all ${projects.length} projects`
              : projects.name}{' '}
            from this workspace?. after removing projects they lose their tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleRemoveProject}
          >
            {Array.isArray(projects) ? 'Remove All' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RemoveProjectDialog;
