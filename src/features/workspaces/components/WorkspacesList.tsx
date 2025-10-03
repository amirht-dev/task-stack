'use client';

import useWorkspacesQuery from '../hooks/useWorkspacesQuery';
import AddWorkspaceCard from './AddWorkspaceCard';
import WorkspaceCard, { WorkspaceCardSkeleton } from './WorkspaceCard';

const WorkspacesList = () => {
  const { isSuccess, isLoading, data } = useWorkspacesQuery();

  return (
    <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {isLoading &&
        Array.from({ length: 6 }, (_, idx) => (
          <li key={idx}>
            <WorkspaceCardSkeleton />
          </li>
        ))}

      {isSuccess &&
        data.map((workspace) => (
          <li key={workspace.$id}>
            <WorkspaceCard workspace={workspace} />
          </li>
        ))}

      {isSuccess && <AddWorkspaceCard />}
    </ul>
  );
};

export default WorkspacesList;
