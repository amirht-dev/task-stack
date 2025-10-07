'use client';

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
import useAuth from '@/features/auth/hooks/useAuth';
import useProjectParam from '@/features/projects/hooks/useProjectParam';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import useProjectsQuery from '@/features/projects/hooks/useProjectsQuery';
import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import compact from 'lodash/compact';
import { Columns3 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import useTasksQuery from '../hooks/useTasksQuery';
import { Tasks } from '../types';
import DeleteTaskDialog from './DeleteTaskDialog';
import TaskActions from './TaskActions';
import TaskStatusBadge from './TaskStatusBadge';

const fallbackData: Tasks = [];

const TasksTable = () => {
  const workspace_id = useWorkspaceParam();
  const project_id = useProjectParam();
  const workspace = useWorkspaceQuery(workspace_id);
  const project = useProjectQuery(workspace_id);
  const tasks = useTasksQuery(project_id);
  const { user } = useAuth();

  const isProjectOwner = user?.$id === project.data?.ownerId;
  const isWorkspaceOwner = user?.$id === workspace.data?.userId;

  const isOwner = isProjectOwner || isWorkspaceOwner;

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Tasks[number]>();

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
        cell: (cell) => <span className="text-nowrap">{cell.getValue()}</span>,
        enableHiding: false,
        meta: {
          skeleton: <Skeleton className="w-20 h-7" />,
        },
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Description"
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
      columnHelper.accessor('dueDate', {
        id: 'Due Date',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Due date"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => (
          <span className="text-nowrap">
            {new Date(props.getValue()).toLocaleDateString()}
          </span>
        ),
        meta: {
          skeleton: <Skeleton className="w-16 h-7" />,
        },
      }),
      columnHelper.accessor('assignee.name', {
        id: 'Assignee',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Assignee"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => (
          <span className="text-nowrap">{props.getValue()}</span>
        ),
        meta: {
          skeleton: <Skeleton className="w-16 h-7" />,
        },
      }),
      columnHelper.accessor('status', {
        id: 'Status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: (props) => <TaskStatusBadge status={props.getValue()} />,
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
                <TaskActions cell={props} />
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
    data: tasks.data ?? fallbackData,
    getRowId: (project) => project.$id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: () => isOwner,
  });

  return (
    <>
      <MultipleTasksRemoveCard table={table} />
      <DataGrid
        table={table}
        recordCount={tasks.data?.length || 0}
        isLoading={tasks.isLoading}
        tableLayout={{
          width: 'auto',
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardTitle>Tasks</CardTitle>
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
    </>
  );
};

function MultipleTasksRemoveCard({ table }: { table: Table<Tasks[number]> }) {
  const selectedTasks = table.getState().rowSelection;
  const workspace_id = useWorkspaceParam();
  const project_id = useProjectParam();
  const projects = useProjectsQuery(workspace_id);
  const tasks = useTasksQuery(project_id);

  const selectedTasksCount = Object.keys(selectedTasks).length;

  if (!tasks.isSuccess) return;

  return (
    <AnimatePresence>
      {!!selectedTasksCount && projects.isSuccess && (
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
                {selectedTasksCount}
                <span className="hidden md:inline"> tasks are </span> selected
              </CardTitle>
              <CardToolbar>
                <Button
                  variant="outline"
                  onClick={() => table.resetRowSelection()}
                >
                  Cancel
                </Button>
                <DeleteTaskDialog
                  trigger={<Button variant="destructive">Delete All</Button>}
                  onRemove={() => table.resetRowSelection()}
                  tasks={tasks.data?.filter(
                    (task) =>
                      task.$id in selectedTasks &&
                      selectedTasks[task.$id] === true
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

export default TasksTable;
