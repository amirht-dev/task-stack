'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useWorkspace from '@/features/workspaces/hooks/useWorkspace';
import { formatMembersCount } from '@/features/workspaces/utils';
import useIsActiveLink from '@/hooks/useIsActiveLink';
import { NextLayout } from '@/types/next';
import Link from 'next/link';
import { PropsWithChildren, use } from 'react';
import { GoChevronLeft } from 'react-icons/go';

const WorkspaceLayout: NextLayout<'workspace_id'> = ({ children, params }) => {
  const { workspace_id } = use(params);
  const workspace = useWorkspace(workspace_id);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background shrink-0">
        <div className="container py-8">
          <div className="flex items-start gap-2">
            <Button variant="dim" size="icon" asChild>
              <Link href="/workspaces">
                <GoChevronLeft />
              </Link>
            </Button>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl">
                <Skeleton
                  size="text"
                  className="w-50"
                  loading={workspace.isLoading}
                >
                  {workspace.data?.name}
                </Skeleton>
              </h3>
              <small className="text-xs text-muted-foreground">
                <Skeleton
                  size="text"
                  className="w-20"
                  loading={workspace.isLoading}
                >
                  {workspace.data?.members &&
                    formatMembersCount(workspace.data?.members)}
                </Skeleton>
              </small>
            </div>

            <div className="flex flex-col ms-auto gap-2 items-end">
              <span className="text-muted-foreground text-sm">
                <Skeleton
                  size="text"
                  className="w-60"
                  loading={workspace.isLoading}
                >
                  Created At:{' '}
                  {workspace.data?.$createdAt &&
                    new Date(workspace.data.$createdAt).toLocaleString()}
                </Skeleton>
              </span>
              <span className="text-muted-foreground text-sm">
                <Skeleton
                  size="text"
                  className="w-60"
                  loading={workspace.isLoading}
                >
                  Updated At:{' '}
                  {workspace.data?.$updatedAt &&
                    new Date(workspace.data.$updatedAt).toLocaleString()}
                </Skeleton>
              </span>
            </div>
          </div>

          <div className="bg-secondary p-0.5 max-w-fit flex gap-1 rounded mt-10">
            <WorkspaceNavLink href={`/workspaces/${workspace_id}`}>
              Overview
            </WorkspaceNavLink>
            <WorkspaceNavLink href={`/workspaces/${workspace_id}/members`}>
              Members
            </WorkspaceNavLink>
            <WorkspaceNavLink href={`/workspaces/${workspace_id}/projects`}>
              Projects
            </WorkspaceNavLink>
          </div>
        </div>
      </div>

      <div className="flex-1 py-8 container">{children}</div>
    </div>
  );
};

export default WorkspaceLayout;

type WorkspaceNavLinkProps = PropsWithChildren<{
  href: string;
}>;

function WorkspaceNavLink({ href, children }: WorkspaceNavLinkProps) {
  const isActive = useIsActiveLink(href);

  return (
    <Button
      size="sm"
      variant={isActive ? 'foreground' : 'dim'}
      className={isActive ? 'bg-white' : 'bg-transparent'}
      asChild
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
