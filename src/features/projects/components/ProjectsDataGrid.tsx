'use client';

import ColumnVisibilitySwitcher from '@/components/ColumnVisibilitySwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/features/auth/hooks/useAuth';
import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import useIsDesktop from '@/hooks/useIsDesktop';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import compact from 'lodash/compact';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import useProjectsQuery from '../hooks/useProjectsQuery';
import { Projects } from '../types';
import CreateProjectModal from './CreateProjectModal';
import ProjectActions from './ProjectActions';
import RemoveProjectDialog from './RemoveProjectDialog';

const fallbackMemberships: Projects = [];

const ProjectsDataGrid = () => {
  const workspace_id = useWorkspaceParam();
  const workspace = useWorkspaceQuery(workspace_id);
  const projects = useProjectsQuery(workspace_id);
  const { user } = useAuth();
  const router = useRouter();

  const isOwner = workspace.data?.userId === user?.$id;

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Projects[number]>();

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
              isOwner ? (
                <span
                  className="flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DataGridTableRowSelect row={row} />
                </span>
              ) : null,
            meta: {
              headerClassName: 'min-w-[50px] w-[50px] p-0',
              cellClassName: 'min-w-[50px] w-[50px] p-0',
            },
            enableSorting: false,
            enableHiding: false,
          })
        : undefined,
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row: { original }, cell }) => (
          <span className="flex items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarImage src={original.image?.url} />
              <AvatarFallback>{original.name.at(0)}</AvatarFallback>
            </Avatar>
            <span className="text-nowrap">{cell.getValue()}</span>
          </span>
        ),
        enableHiding: false,
        meta: {
          skeleton: <Skeleton className="w-20 h-7" />,
        },
      }),
      columnHelper.accessor('owner.name', {
        id: 'Owner',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Owner"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => (
          <span className="text-nowrap">{props.getValue() || '-'}</span>
        ),
        meta: {
          skeleton: <Skeleton className="w-40 h-7" />,
        },
      }),
      columnHelper.accessor('$createdAt', {
        id: 'Created At',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Created At"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => (
          <span className="text-nowrap">
            {new Date(props.getValue()).toLocaleString()}
          </span>
        ),
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
                <ProjectActions cell={props} />
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
    data: projects.data ?? fallbackMemberships,
    getRowId: (project) => project.$id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: () => isOwner,
  });

  return (
    <>
      <MultipleProjectsRemoveCard table={table} />
      <DataGrid
        table={table}
        recordCount={projects.data?.length || 0}
        isLoading={projects.isLoading}
        tableLayout={{
          width: 'auto',
        }}
        onRowClick={(row) => router.push(`projects/${row.$id}`)}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardTitle>Projects</CardTitle>
            <CardToolbar>
              <ColumnVisibilitySwitcher table={table} />
              <DataGridCreateProjectModal />
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

function MultipleProjectsRemoveCard({
  table,
}: {
  table: Table<Projects[number]>;
}) {
  const selectedProjects = table.getState().rowSelection;
  const workspace_id = useWorkspaceParam();
  const projects = useProjectsQuery(workspace_id);

  const selectedProjectsCount = Object.keys(selectedProjects).length;

  return (
    <AnimatePresence>
      {!!selectedProjectsCount && projects.isSuccess && (
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
              <CardTitle className="leading-none font-normal">
                {selectedProjectsCount}
                <span className="hidden md:inline"> projects are </span>{' '}
                selected
              </CardTitle>
              <CardToolbar>
                <Button
                  variant="outline"
                  onClick={() => table.resetRowSelection()}
                >
                  Cancel
                </Button>
                <RemoveProjectDialog
                  trigger={<Button variant="destructive">Remove</Button>}
                  onRemove={() => table.resetRowSelection()}
                  projects={projects.data?.filter(
                    (project) =>
                      project.$id in selectedProjects &&
                      selectedProjects[project.$id] === true
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

export default ProjectsDataGrid;

function DataGridCreateProjectModal() {
  const isDesktop = useIsDesktop();
  const workspace_id = useWorkspaceParam();

  return (
    <CreateProjectModal
      defaultWorkspaceId={workspace_id}
      trigger={
        <Button size={isDesktop ? 'md' : 'icon'}>
          <HiOutlineViewGridAdd />
          <span className="max-lg:hidden">Create Project</span>
        </Button>
      }
    />
  );
}
