import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WorkspaceNotFound = () => {
  return (
    <div className="grid min-h-full place-items-center bg-background text-foreground px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Workspace not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          Sorry, we couldn’t find the workspace you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/workspaces">Go back to workspaces</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceNotFound;
