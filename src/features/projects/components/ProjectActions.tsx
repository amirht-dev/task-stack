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
import { Projects } from '../types';
import RemoveProjectDialog from './RemoveProjectDialog';

function ProjectActions({
  cell,
}: {
  cell: CellContext<Projects[number], unknown>;
}) {
  const [open, setOpen] = useState(false);
  const workspace_id = useWorkspaceParam();
  const { user, isAuthenticating, isUnauthenticated } = useAuth();
  const workspace = useWorkspaceQuery(workspace_id);

  const isOwner = workspace.data?.userId === user?.$id;

  if (isAuthenticating || workspace.isLoading)
    return <Skeleton size="box" className="size-8" />;

  if (isUnauthenticated || !isOwner) return null;

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
          <RemoveProjectDialog
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                variant="destructive"
              >
                <Trash />
                remove
              </DropdownMenuItem>
            }
            projects={cell.row.original}
            onRemove={() => setOpen(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProjectActions;
