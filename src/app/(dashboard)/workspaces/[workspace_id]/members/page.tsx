'use client';

import Toast from '@/components/Toast';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/features/auth/hooks/useAuth';
import { removeMembersAction } from '@/features/workspaces/actions';
import InviteMemberDialog from '@/features/workspaces/components/InviteMemberDialog';
import useMembersQuery from '@/features/workspaces/hooks/useMembersQuery';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { useQueryClient } from '@tanstack/react-query';
import {
  CellContext,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Models } from 'appwrite';
import compact from 'lodash/compact';
import { Columns3, Trash } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { ReactNode, startTransition, use, useMemo, useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { toast } from 'sonner';

const fallbackMemberships: Models.Membership[] = [];

const WorkspaceMembersPage = ({
  params,
}: PageProps<'/workspaces/[workspace_id]/members'>) => {
  const { workspace_id } = use(params);
  const workspace = useWorkspaceQuery(workspace_id);
  const members = useMembersQuery({
    workspaceId: workspace_id,
    teamId: workspace.data?.teamId,
  });

  const isOwner = workspace.data?.user.roles.includes('owner');

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Models.Membership>();

    const columns = [
      isOwner
        ? columnHelper.display({
            id: 'select',
            header: () => (
              <span className="flex items-center justify-center">
                <DataGridTableRowSelectAll />
              </span>
            ),
            cell: ({ row }) =>
              row.original.roles.includes('owner') ? null : (
                <span className="flex items-center justify-center">
                  <DataGridTableRowSelect row={row} />
                </span>
              ),
            meta: {
              headerClassName: 'w-[50px] p-0',
              cellClassName: 'w-[50px] p-0',
            },
            enableSorting: false,
            enableHiding: false,
          })
        : undefined,
      columnHelper.accessor('userName', {
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => props.getValue(),
        enableHiding: false,
        meta: {
          skeleton: <Skeleton className="w-20 h-7" />,
        },
      }),
      columnHelper.accessor('userEmail', {
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => props.getValue(),
        meta: {
          skeleton: <Skeleton className="w-40 h-7" />,
        },
      }),
      columnHelper.accessor('roles', {
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Roles"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) =>
          props.getValue().map((role) => (
            <Badge
              key={role}
              appearance="light"
              variant={role === 'owner' ? 'primary' : 'info'}
              className="shrink-0"
            >
              {role}
            </Badge>
          )),
        meta: {
          skeleton: <Skeleton className="w-16 h-7" />,
        },
      }),
      columnHelper.accessor('joined', {
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Joined"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) =>
          props.getValue() ? new Date(props.getValue()).toLocaleString() : '-',
        meta: {
          skeleton: <Skeleton className="w-40 h-7" />,
        },
      }),
      columnHelper.accessor('confirm', {
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => {
          const isConfirmed = props.getValue();

          return (
            <Badge
              variant={isConfirmed ? 'success' : 'warning'}
              appearance="outline"
            >
              {isConfirmed ? 'confirmed' : 'unconfirmed'}
            </Badge>
          );
        },
        meta: {
          skeleton: <Skeleton className="w-16 h-7" />,
        },
      }),
      isOwner
        ? columnHelper.display({
            header: '',
            id: 'actions',
            cell: (props) => (
              <span className="flex items-center justify-center">
                <MemberActions cell={props} />
              </span>
            ),
            meta: {
              headerClassName: 'w-[60px] p-0',
              cellClassName: 'w-[60px] p-0',
            },
            enableHiding: false,
          })
        : undefined,
    ];

    return compact(columns);
  }, [isOwner]);

  const table = useReactTable({
    columns,
    data: members.data?.memberships ?? fallbackMemberships,
    getRowId: (member) => member.$id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: (row) => !row.original.roles.includes('owner'),
  });

  const selectedMembers = table.getState().rowSelection;

  const selectedMembersCount = Object.keys(selectedMembers).length;

  return (
    <>
      <AnimatePresence>
        {!!selectedMembersCount && members.isSuccess && (
          <motion.div
            variants={{ hidden: { y: 200 }, visible: { y: 0 } }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed z-10 bottom-12 left-1/2 -translate-x-1/2"
            transition={{ bounce: 0, duration: 0.18 }}
          >
            <Card>
              <CardContent className="min-w-md flex items-center justify-between">
                <CardTitle>
                  {selectedMembersCount} members are selected
                </CardTitle>
                <CardToolbar>
                  <Button
                    variant="outline"
                    onClick={() => table.resetRowSelection()}
                  >
                    Cancel
                  </Button>
                  <RemoveMemberDialog
                    trigger={<Button variant="destructive">Remove</Button>}
                    onRemove={() => table.resetRowSelection()}
                    memberships={members.data.memberships.filter(
                      (membership) =>
                        membership.$id in selectedMembers &&
                        selectedMembers[membership.$id] === true
                    )}
                  />
                </CardToolbar>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <DataGrid
        table={table}
        recordCount={members.data?.total || 0}
        isLoading={workspace.isLoading}
        tableLayout={{
          cellBorder: true,
          width: 'auto',
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardTitle>Members</CardTitle>
            <CardToolbar>
              <DataGridColumnVisibility
                table={table}
                trigger={
                  <Button variant="outline" size="icon">
                    <Columns3 />
                  </Button>
                }
              />
              {isOwner && workspace.isSuccess && (
                <InviteMemberDialog
                  teamId={workspace.data?.teamId}
                  workspaceId={workspace_id}
                />
              )}
            </CardToolbar>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
    </>
  );
};

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

function RemoveMemberDialog({
  trigger,
  memberships,
  onRemove,
}: {
  trigger: ReactNode;
  memberships: Models.Membership | Models.Membership[];
  onRemove?: () => void;
}) {
  const queryClient = useQueryClient();
  const { workspace_id } = useParams<{ workspace_id: string }>();
  const workspace = useWorkspaceQuery(workspace_id);
  const teamId = workspace.data?.teamId;

  const handleRemoveMember = async () => {
    if (!teamId) return;

    onRemove?.();
    startTransition(async () => {
      const id = toast.custom(
        () => (
          <Toast
            variant="loading"
            title={
              Array.isArray(memberships)
                ? `Removing ${memberships.length} members...`
                : `Removing ${memberships.userName}...`
            }
          />
        ),
        {
          id: Array.isArray(memberships)
            ? 'remove-members'
            : `remove-member-${memberships.$id}`,
        }
      );
      const res = await removeMembersAction({
        teamId,
        membershipIds: Array.isArray(memberships)
          ? memberships.map((member) => member.$id)
          : memberships.$id,
      });
      if (res.success) {
        toast.custom(
          () => (
            <Toast
              variant="success"
              title={
                Array.isArray(memberships)
                  ? `All ${memberships.length} members removed`
                  : `${memberships.userName} is removed`
              }
            />
          ),
          {
            id,
          }
        );
        await queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        });
      } else {
        toast.custom(
          () => (
            <Toast
              variant="destructive"
              title={
                Array.isArray(memberships)
                  ? `Failed to remove ${memberships.length} members`
                  : `Failed to remove ${memberships.userName}`
              }
              description={res.error.message}
            />
          ),
          {
            id,
          }
        );
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {Array.isArray(memberships)
              ? `Remove all ${memberships.length} members?`
              : `Remove ${memberships.userName}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{' '}
            {Array.isArray(memberships)
              ? `all ${memberships.length} members`
              : memberships.userName}{' '}
            from this workspace?. after removing members they lose their roles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRemoveMember}>
            {Array.isArray(memberships) ? 'Remove All' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default WorkspaceMembersPage;
