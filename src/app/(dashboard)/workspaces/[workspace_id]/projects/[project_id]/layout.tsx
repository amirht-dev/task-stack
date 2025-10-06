'use client';

import NavLink from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/features/auth/hooks/useAuth';
import ProjectNotFound from '@/features/projects/components/ProjectNotFound';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import { NotFoundException } from '@/utils/exceptions';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
import { use } from 'react';
import { GoChevronLeft } from 'react-icons/go';

const ProjectLayout = ({
  children,
  params,
}: LayoutProps<'/workspaces/[workspace_id]/projects/[project_id]'>) => {
  const { project_id, workspace_id } = use(params);
  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useProjectQuery(project_id);
  const { user } = useAuth();
  const isUserIsOwner = project?.ownerId === user?.$id;

  if (isError && error instanceof NotFoundException) return <ProjectNotFound />;

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 bg-secondary text-secondary-foreground">
        <div className="container py-8">
          <span className="uppercase text-xs text-muted-foreground ms-10">
            project
          </span>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
            <div className="flex items-start gap-2">
              <Button variant="dim" size="icon" asChild>
                <Link href={`/workspaces/${workspace_id}/projects`}>
                  <GoChevronLeft />
                </Link>
              </Button>

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl">
                  <Skeleton size="text" className="w-50" loading={isLoading}>
                    {project?.name}
                  </Skeleton>
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span
                className="text-muted-foreground text-xs lg:text-sm"
                title={
                  project?.$createdAt
                    ? new Date(project?.$createdAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-40" loading={isLoading}>
                  Created{' '}
                  {project?.$createdAt &&
                    formatDistanceToNow(project.$createdAt, {
                      addSuffix: true,
                    })}
                </Skeleton>
              </span>
              <span
                className="text-muted-foreground text-xs lg:text-sm"
                title={
                  project?.$updatedAt
                    ? new Date(project?.$updatedAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-40" loading={isLoading}>
                  Updated{' '}
                  {project?.$updatedAt &&
                    formatDistanceToNow(project.$updatedAt, {
                      addSuffix: true,
                    })}
                </Skeleton>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-10">
            <Tabs className="max-w-fit">
              <TabsList size="sm">
                <TabsTrigger value="overview" asChild>
                  <NavLink
                    href={`/workspaces/${workspace_id}/projects/${project_id}`}
                    basePath={`/workspaces/${workspace_id}/projects/${project_id}`}
                  >
                    Overview
                  </NavLink>
                </TabsTrigger>
                {isUserIsOwner && (
                  <TabsTrigger value="settings" asChild>
                    <NavLink
                      href={`/workspaces/${workspace_id}/projects/${project_id}/settings`}
                      basePath={`/workspaces/${workspace_id}/projects/${project_id}`}
                    >
                      Settings
                    </NavLink>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 py-8 container">{children}</div>
    </div>
  );
};

export default ProjectLayout;
