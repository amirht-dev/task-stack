'use client';

import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import { use } from 'react';

const ProjectPage = ({ params }: PageProps<'/projects/[project_id]'>) => {
  const { project_id } = use(params);
  const { data: project } = useProjectQuery(project_id);

  return <div>{project?.name}</div>;
};

export default ProjectPage;
