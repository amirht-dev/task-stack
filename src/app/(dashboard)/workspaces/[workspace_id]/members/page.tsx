import MembersDataGrid from '@/features/members/components/MembersDataGrid';

const WorkspaceMembersPage = async ({
  params,
}: PageProps<'/workspaces/[workspace_id]/members'>) => {
  const { workspace_id } = await params;

  return <MembersDataGrid workspaceId={workspace_id} />;
};

export default WorkspaceMembersPage;
