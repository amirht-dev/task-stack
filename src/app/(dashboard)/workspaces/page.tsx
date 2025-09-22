import WorkspacesList from '@/features/workspaces/components/WorkspacesList';
import { NextPage } from '@/types/next';

const WorkspacesPage: NextPage = () => {
  return (
    <div className="py-8 container">
      <WorkspacesList />
    </div>
  );
};

export default WorkspacesPage;
