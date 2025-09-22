import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import useWorkspacesQuery from '@/features/workspaces/hooks/useWorkspacesQuery';

function useWorkspace(workspaceId: string) {
  const query = useWorkspacesQuery();
  const { user } = useAuthContext();

  const workspace = query.data?.rows.find(
    (workspace) => workspace.$id === workspaceId
  );

  const userRoles = workspace?.members.memberships.find(
    (member) => member.userId === user?.$id
  )?.roles;

  return {
    ...query,
    data: workspace,
    userRoles,
  };
}

export default useWorkspace;
