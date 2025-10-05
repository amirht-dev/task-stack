import { useParams } from 'next/navigation';

function useProjectParam() {
  const { project_id } = useParams<{ project_id: string }>();
  if (!project_id)
    throw new Error(
      'useProjectParam must be used inside project_id dynamic page'
    );

  return project_id;
}

export default useProjectParam;
