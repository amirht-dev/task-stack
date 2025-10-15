'use client';

import NavLink from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/features/auth/hooks/useAuth';
import LeaveWorkspaceDialog from '@/features/workspaces/components/LeaveWorkspaceDialog';
import WorkspaceNotFound from '@/features/workspaces/components/WorkspaceNotFound';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { formatMembersCount } from '@/features/workspaces/utils';
import { NotFoundException } from '@/utils/exceptions';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
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
  const { user } = useAuth();

  if (isError && error instanceof NotFoundException)
    return <WorkspaceNotFound />;

  const isOwner = workspace?.userId === user?.$id;

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 bg-secondary text-secondary-foreground">
        <div className="container py-8">
          <span className="uppercase text-xs text-muted-foreground ms-10">
            workspace
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
                    {workspace?.name}
                  </Skeleton>
                </h3>
                <small className="text-xs text-muted-foreground">
                  <Skeleton size="text" className="w-20" loading={isLoading}>
                    {workspace && formatMembersCount(workspace.totalMembers)}
                  </Skeleton>
                </small>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span
                className="text-muted-foreground text-xs lg:text-sm"
                title={
                  workspace?.$createdAt
                    ? new Date(workspace?.$createdAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-40" loading={isLoading}>
                  Created{' '}
                  {workspace?.$createdAt &&
                    formatDistanceToNow(workspace.$createdAt, {
                      addSuffix: true,
                    })}
                </Skeleton>
              </span>
              <span
                className="text-muted-foreground text-xs lg:text-sm"
                title={
                  workspace?.$updatedAt
                    ? new Date(workspace?.$updatedAt).toLocaleString()
                    : undefined
                }
              >
                <Skeleton size="text" className="w-40" loading={isLoading}>
                  Updated{' '}
                  {workspace?.$updatedAt &&
                    formatDistanceToNow(workspace.$updatedAt, {
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
                {isOwner && (
                  <TabsTrigger value="settings" asChild>
                    <NavLink
                      href={`/workspaces/${workspace_id}/settings`}
                      basePath={`/workspaces/${workspace_id}`}
                    >
                      Settings
                    </NavLink>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            <LeaveWorkspaceDialog />
          </div>
        </div>
      </div>

      <div className="flex-1 py-8 container">{children}</div>
    </div>
  );
};

export default WorkspaceLayout;
