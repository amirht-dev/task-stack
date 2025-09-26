import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import useWorkspaceQuery from './useWorkspaceQuery';

function useWorkspaceUserRoles(workspaceId: string) {
  const { user } = useAuthContext();
  const { data: workspace } = useWorkspaceQuery(workspaceId);

  const roles = workspace?.members.memberships.find(
    (member) => member.userId === user?.$id
  )?.roles;

  return {
    roles,
    isOwner: roles?.includes('owner'),
  };
}

export default useWorkspaceUserRoles;
