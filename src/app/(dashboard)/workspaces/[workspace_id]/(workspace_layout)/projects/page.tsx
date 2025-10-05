'use client';

import { use } from 'react';

function WorkspaceProjectsPage({
  params,
}: PageProps<'/workspaces/[workspace_id]/projects'>) {
  const { workspace_id } = use(params);
  return <div>workspace {workspace_id} projects</div>;
}

export default WorkspaceProjectsPage;
