'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/features/auth/hooks/useAuth';
import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { CellContext } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { Tasks } from '../types';
import DeleteTaskDialog from './DeleteTaskDialog';
import useProjectParam from '@/features/projects/hooks/useProjectParam';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';

function TaskActions({ cell }: { cell: CellContext<Tasks[number], unknown> }) {
  const [open, setOpen] = useState(false);
  const workspace_id = useWorkspaceParam();
  const project_id = useProjectParam();
  const { user, isAuthenticating } = useAuth();
  const workspace = useWorkspaceQuery(workspace_id);
  const project = useProjectQuery(project_id);

  const isWorkspaceOwner = workspace.data?.userId === user?.$id;
  const isProjectOwner = project.data?.ownerId === user?.$id;

  const isOwner = isWorkspaceOwner || isProjectOwner;

  if (isAuthenticating || workspace.isLoading)
    return <Skeleton size="box" className="size-8" />;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <BsThreeDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isOwner && (
          <DeleteTaskDialog
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                variant="destructive"
              >
                <Trash />
                delete
              </DropdownMenuItem>
            }
            tasks={cell.row.original}
            onRemove={() => setOpen(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskActions;
