'use client';

import NavLink from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { formatMembersCount } from '@/features/workspaces/utils';
import { NotFoundException } from '@/utils/exceptions';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { GoChevronLeft } from 'react-icons/go';

const WorkspaceLayout = ({
  children,
  params,
}: LayoutProps<'/workspaces/[workspace_id]'>) => {
  const { workspace_id } = use(params);
  const {
    isLoading,
    data: workspace,
    isError,
    error,
  } = useWorkspaceQuery(workspace_id);

  if (isError && error instanceof NotFoundException) return notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 bg-secondary text-secondary-foreground">
        <div className="container py-8">
          <div className="flex items-start gap-2">
            <Button variant="dim" size="icon" asChild>
              <Link href="/workspaces">
                <GoChevronLeft />
              </Link>
            </Button>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl">
                <Skeleton size="text" className="w-50" loading={isLoading}>
                  {workspace?.name}
                </Skeleton>
              </h3>
              <small className="text-xs text-muted-foreground">
                <Skeleton size="text" className="w-20" loading={isLoading}>
                  {workspace && formatMembersCount(workspace.totalMembers)}
                </Skeleton>
              </small>
            </div>

            <div className="flex flex-col ms-auto gap-2 items-end">
              <span
                className="text-muted-foreground text-sm"
                title={
                  workspace?.$createdAt
                    ? new Date(workspace?.$createdAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-60" loading={isLoading}>
                  Created{' '}
                  {workspace?.$createdAt &&
                    formatDistanceToNow(workspace.$createdAt, {
                      addSuffix: true,
                    })}
                </Skeleton>
              </span>
              <span
                className="text-muted-foreground text-sm"
                title={
                  workspace?.$updatedAt
                    ? new Date(workspace?.$updatedAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-60" loading={isLoading}>
                  Updated{' '}
                  {workspace?.$updatedAt &&
                    formatDistanceToNow(workspace.$updatedAt, {
                      addSuffix: true,
                    })}
                </Skeleton>
              </span>
            </div>
          </div>

          <Tabs className="max-w-fit mt-10">
            <TabsList size="sm">
              <TabsTrigger value="overview" asChild>
                <NavLink
                  href={`/workspaces/${workspace_id}`}
                  basePath={`/workspaces/${workspace_id}`}
                >
                  Overview
                </NavLink>
              </TabsTrigger>
              <TabsTrigger value="members" asChild>
                <NavLink
                  href={`/workspaces/${workspace_id}/members`}
                  basePath={`/workspaces/${workspace_id}`}
                >
                  Members
                </NavLink>
              </TabsTrigger>
              <TabsTrigger value="projects" asChild>
                <NavLink
                  href={`/workspaces/${workspace_id}/projects`}
                  basePath={`/workspaces/${workspace_id}`}
                >
                  Projects
                </NavLink>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 py-8 container">{children}</div>
    </div>
  );
};

export default WorkspaceLayout;
