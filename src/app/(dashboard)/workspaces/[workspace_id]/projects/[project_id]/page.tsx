'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import TasksTable from '@/features/tasks/components/TasksTable';
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

          {project.isSuccess && (
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
        <TabsContent value={tab.kanban.id}>kanban</TabsContent>
        <TabsContent value={tab.calendar.id}>calendar</TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;
