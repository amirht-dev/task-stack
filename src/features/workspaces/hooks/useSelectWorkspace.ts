import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import useWorkspacesQuery from './useWorkspacesQuery';

function useSelectWorkspace() {
  const workspace = useGlobalStore((store) => store.workspace);
  const setWorkspace = useGlobalStore((store) => store.setWorkspace);
  const { data, isSuccess } = useWorkspacesQuery();

  const selectWorkspace = (workspaceId: string) => {
    if (isSuccess)
      setWorkspace(
        data.find((workspace) => workspace.$id === workspaceId) ?? null
      );
  };

  return { selectedWorkspace: workspace, selectWorkspace };
}

export default useSelectWorkspace;
