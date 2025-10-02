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
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { CellContext } from '@tanstack/react-table';
import { Models } from 'appwrite';
import { Trash } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import RemoveMemberDialog from './RemoveMemberDialog';

function MemberActions({
  cell,
}: {
  cell: CellContext<Models.Membership, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const { workspace_id } = useParams<{ workspace_id: string }>();
  const { user, isAuthenticating, isUnauthenticated } = useAuth();
  const workspace = useWorkspaceQuery(workspace_id);

  const membership = cell.row.original;

  const isUserIsOwner = workspace.data?.user.roles.includes('owner');

  const isMySelf = user?.$id === membership.userId;

  const isOwner = membership.roles.includes('owner');

  if (isAuthenticating) return <Skeleton size="box" className="size-8" />;

  if (isUnauthenticated || isMySelf || !isUserIsOwner || isOwner) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <BsThreeDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isUserIsOwner && !isMySelf && (
          <RemoveMemberDialog
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                variant="destructive"
              >
                <Trash />
                remove
              </DropdownMenuItem>
            }
            memberships={membership}
            onRemove={() => setOpen(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MemberActions;
