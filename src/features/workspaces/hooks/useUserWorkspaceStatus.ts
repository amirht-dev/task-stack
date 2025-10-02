import useAuth from '@/features/auth/hooks/useAuth';
import useMembersQuery from '@/features/members/hooks/useMembersQuery';
import useWorkspace from './useWorkspace';
import useWorkspaceParam from './useWorkspaceParam';

function useUserWorkspaceStatus() {
  const { user } = useAuth();
  const workspaceId = useWorkspaceParam();
  const workspace = useWorkspace();
  const members = useMembersQuery({
    teamId: workspace.data?.teamId,
    workspaceId,
  });

  const membership = members.isSuccess
    ? members.data.memberships.find(
        (membership) => membership.userId === user?.$id
      )
    : undefined;

  return {
    isLoading: workspace.isLoading || members.isLoading,
    membership,
    isOwner: membership?.roles.includes('owner'),
    isMember: membership?.roles.includes('member'),
  };
}

export default useUserWorkspaceStatus;
