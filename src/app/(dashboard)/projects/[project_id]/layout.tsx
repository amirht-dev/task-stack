'use client';

import NavLink from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useProjectQuery from '@/features/projects/hooks/useProjectQuery';
import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import { NotFoundException } from '@/utils/exceptions';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect } from 'react';
import { GoChevronLeft } from 'react-icons/go';

const ProjectLayout = ({
  children,
  params,
}: LayoutProps<'/projects/[project_id]'>) => {
  const { project_id } = use(params);
  const {
    data: project,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useProjectQuery(project_id);
  const { selectWorkspace } = useSelectWorkspace();

  useEffect(() => {
    if (isSuccess) selectWorkspace(project.workspace);
  }, [selectWorkspace, project, isSuccess]);

  if (isError && error instanceof NotFoundException) return notFound();

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
                <Link href="/workspaces">
                  <GoChevronLeft />
                </Link>
              </Button>

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl">
                  <Skeleton size="text" className="w-50" loading={isLoading}>
                    {project?.name}
                  </Skeleton>
                </h3>
                {/* <small className="text-xs text-muted-foreground">
                  <Skeleton size="text" className="w-20" loading={isLoading}>
                    {workspace && formatMembersCount(workspace.totalMembers)}
                  </Skeleton>
                </small> */}
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
                    href={`/projects/${project_id}`}
                    basePath={`/projects/${project_id}`}
                  >
                    Overview
                  </NavLink>
                </TabsTrigger>
                <TabsTrigger value="members" asChild>
                  <NavLink
                    href={`/projects/${project_id}/members`}
                    basePath={`/projects/${project_id}`}
                  >
                    Members
                  </NavLink>
                </TabsTrigger>
                <TabsTrigger value="projects" asChild>
                  <NavLink
                    href={`/projects/${project_id}/projects`}
                    basePath={`/projects/${project_id}`}
                  >
                    Projects
                  </NavLink>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* <LeaveWorkspaceDialog /> */}
          </div>
        </div>
      </div>

      <div className="flex-1 py-8 container">{children}</div>
    </div>
  );
};

export default ProjectLayout;
