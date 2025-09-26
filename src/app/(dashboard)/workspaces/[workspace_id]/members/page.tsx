'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
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
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { NextPage } from '@/types/next';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Models } from 'appwrite';
import { Columns3 } from 'lucide-react';
import { use, useMemo } from 'react';

const fallbackMemberships: Models.Membership[] = [];

const WorkspaceMembersPage: NextPage<'workspace_id'> = ({ params }) => {
  const { workspace_id } = use(params);
  const workspace = useWorkspaceQuery(workspace_id);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Models.Membership>();

    return [
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
        cell: (props) => new Date(props.getValue()).toLocaleString(),
        meta: {
          skeleton: <Skeleton className="w-40 h-7" />,
        },
      }),
      columnHelper.accessor('confirm', {
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
    ];
  }, []);

  const membershipList = workspace.data?.members;

  const table = useReactTable({
    columns,
    data: membershipList?.memberships ?? fallbackMemberships,
    getRowId: (member) => member.$id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={membershipList?.total || 0}
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
  );
};

export default WorkspaceMembersPage;
