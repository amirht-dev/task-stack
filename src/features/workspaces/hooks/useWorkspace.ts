import useWorkspaceParam from './useWorkspaceParam';
import useWorkspaceQuery from './useWorkspaceQuery';

function useWorkspace() {
  const workspaceId = useWorkspaceParam();
  return useWorkspaceQuery(workspaceId);
}

export default useWorkspace;
