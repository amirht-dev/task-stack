import { useParams } from 'next/navigation';

function useWorkspaceParam() {
  const { workspace_id } = useParams<{ workspace_id: string }>();

  if (!workspace_id)
    throw new Error('useWorkspaceParam must be in workspace dynamic route');

  return workspace_id;
}

export default useWorkspaceParam;
