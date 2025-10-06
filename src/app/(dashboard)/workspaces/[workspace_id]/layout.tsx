'use client';

import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { use, useEffect } from 'react';

function WorkspaceRootLayout({
  children,
  params,
}: LayoutProps<'/workspaces/[workspace_id]'>) {
  const { workspace_id } = use(params);
  const { selectWorkspace } = useSelectWorkspace();
  const workspace = useWorkspaceQuery(workspace_id);

  useEffect(() => {
    if (workspace.isSuccess) selectWorkspace(workspace.data.$id);
  }, [selectWorkspace, workspace]);

  return children;
}

export default WorkspaceRootLayout;
