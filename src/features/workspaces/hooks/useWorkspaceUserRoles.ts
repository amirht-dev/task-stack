import useAuth from '@/features/auth/hooks/useAuth';
import useWorkspaceQuery from './useWorkspaceQuery';

function useWorkspaceUserRoles(workspaceId: string) {
  const { user } = useAuth();
  const { data: workspace } = useWorkspaceQuery(workspaceId);

  const roles = workspace?.members.memberships.find(
    (member) => member.userId === user?.$id
  )?.roles;

  return {
    roles,
    isOwner: roles?.includes('owner'),
    isMember: roles?.includes('member'),
  };
}

export default useWorkspaceUserRoles;
