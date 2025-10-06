'use client';

import ProjectsDataGrid from '@/features/projects/components/ProjectsDataGrid';
import { use } from 'react';

function WorkspaceProjectsPage({
  params,
}: PageProps<'/workspaces/[workspace_id]/projects'>) {
  const { workspace_id } = use(params);

  return <ProjectsDataGrid />;
}

export default WorkspaceProjectsPage;
