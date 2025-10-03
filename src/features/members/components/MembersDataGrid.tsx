'use client';

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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import InviteMemberDialog from '@/features/members/components/InviteMemberDialog';
import useMembersQuery from '@/features/members/hooks/useMembersQuery';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import { Models } from 'appwrite';
import compact from 'lodash/compact';
import { Columns3 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import MemberActions from './MemberActions';
import RemoveMemberDialog from './RemoveMemberDialog';

const fallbackMemberships: Models.Membership[] = [];

const MembersDataGrid = ({ workspaceId }: { workspaceId: string }) => {
  const workspace = useWorkspaceQuery(workspaceId);
  const members = useMembersQuery({
    workspaceId,
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
              headerClassName: 'min-w-[50px] w-[50px] p-0',
              cellClassName: 'min-w-[50px] w-[50px] p-0',
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
          cellClassName: 'text-nowrap',
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
              headerClassName: 'min-w-[60px] w-[60px] p-0',
              cellClassName: 'min-w-[60px] w-[60px] p-0',
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

  return (
    <>
      <MultipleMembersRemoveCard table={table} workspaceId={workspaceId} />
      <DataGrid
        table={table}
        recordCount={members.data?.total || 0}
        isLoading={members.isLoading}
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
                  workspaceId={workspaceId}
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

function MultipleMembersRemoveCard({
  table,
  workspaceId,
}: {
  table: Table<Models.Membership>;
  workspaceId: string;
}) {
  const selectedMembers = table.getState().rowSelection;
  const workspace = useWorkspaceQuery(workspaceId);
  const members = useMembersQuery({
    workspaceId,
    teamId: workspace.data?.teamId,
  });

  const selectedMembersCount = Object.keys(selectedMembers).length;

  return (
    <AnimatePresence>
      {!!selectedMembersCount && members.isSuccess && (
        <motion.div
          variants={{ hidden: { y: 200 }, visible: { y: 0 } }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed z-10 bottom-12 left-1/2 -translate-x-1/2 min-w-xs"
          transition={{ bounce: 0, duration: 0.18 }}
        >
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <CardTitle className="leading-none">
                {selectedMembersCount}
                <span className="hidden md:inline">members are </span> selected
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
  );
}

export default MembersDataGrid;
