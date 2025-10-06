'use client';

import { Button } from '@/components/ui/button';
import useWorkspaceParam from '@/features/workspaces/hooks/useWorkspaceParam';
import Link from 'next/link';

function ProjectNotFound() {
  const workspace_id = useWorkspaceParam();
  return (
    <div className="grid min-h-full place-items-center bg-background text-foreground px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Project not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          Sorry, we couldn’t find the Project you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href={`/workspaces/${workspace_id}/projects`}>
              Go back to Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectNotFound;
