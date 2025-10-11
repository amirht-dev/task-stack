'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/features/auth/hooks/useAuth';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import TasksCalendar from '@/features/tasks/components/TasksCalendar';
import TasksKanban from '@/features/tasks/components/TasksKanban';
import TasksTable from '@/features/tasks/components/TasksTable';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { use } from 'react';
import { MdAddTask } from 'react-icons/md';

const tab = {
  table: { id: 'table', label: 'Table' },
  kanban: { id: 'kanban', label: 'Kanban' },
  calendar: { id: 'calendar', label: 'Calendar' },
};

const ProjectPage = ({
  params,
}: PageProps<'/workspaces/[workspace_id]/projects/[project_id]'>) => {
  const { project_id, workspace_id } = use(params);
  const project = useProjectQuery(project_id);
  const workspace = useWorkspaceQuery(workspace_id);

  const { user } = useAuth();

  const isProjectOwner = project.data?.ownerId === user?.$id;
  const isWorkspaceOwner = workspace.data?.userId === user?.$id;

  const isOwner = isProjectOwner || isWorkspaceOwner;

  return (
    <div>
      <Tabs defaultValue={tab.table.id}>
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <TabsList
            variant="line"
            className="flex-1 grid grid-cols-3 md:max-w-fit"
          >
            {Object.values(tab).map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {project.isSuccess && isOwner && (
            <CreateTaskModal
              defaultProjectId={project_id}
              defaultWorkspaceId={workspace_id}
              trigger={
                <Button
                  disabled={project.isLoading}
                  className="max-md:w-full shrink-0"
                >
                  <MdAddTask /> <span>New Task</span>
                </Button>
              }
            />
          )}
        </div>

        <TabsContent value={tab.table.id}>
          <TasksTable />
        </TabsContent>
        <TabsContent value={tab.kanban.id}>
          <TasksKanban />
        </TabsContent>
        <TabsContent value={tab.calendar.id}>
          <TasksCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;
