'use client';

import useWorkspacesQuery from '../hooks/useWorkspacesQuery';
import AddWorkspaceCard from './AddWorkspaceCard';
import WorkspaceCard from './WorkspaceCard';

const WorkspacesList = () => {
  const { isSuccess, data } = useWorkspacesQuery();

  if (!isSuccess) return;

  return (
    <ul className="grid grid-cols-5 gap-4">
      {data.rows.map((workspace) => (
        <li key={workspace.$id}>
          <WorkspaceCard workspaceId={workspace.$id} />
        </li>
      ))}
      <AddWorkspaceCard />
    </ul>
  );
};

export default WorkspacesList;
