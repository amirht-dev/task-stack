'use client';

import AnalyticCard, { AnalyticSkeletonCard } from '@/components/AnalyticCard';
import ErrorCard from '@/components/ErrorCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useWorkspaceAnalyticsQuery from '@/features/workspaces/hooks/useWorkspaceAnalyticsQuery';
import useWorkspaceQuery from '@/features/workspaces/hooks/useWorkspaceQuery';
import { formatAvatarFallback } from '@/features/workspaces/utils';

const WorkspaceOverviewPage = ({}: PageProps<'/workspaces/[workspace_id]'>) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <WorkspaceInfoCard />
      <WorkspaceAnalytics />
    </div>
  );
};

export default WorkspaceOverviewPage;

function WorkspaceInfoCard() {
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isSuccess: isSuccessWorkspace,
    isError: isErrorWorkspace,
  } = useWorkspaceQuery();

  if (isErrorWorkspace) return 'error';

  return (
    <Card className="">
      <CardContent>
        <div className="flex items-center gap-4 md:gap-8">
          {isLoadingWorkspace ? (
            <Skeleton size="box" className="size-16 lg:size-20 rounded-full" />
          ) : (
            isSuccessWorkspace && (
              <Avatar className="size-16 md:size-20">
                {workspace.image && (
                  <AvatarImage src={workspace.image.url} alt={workspace.name} />
                )}
                <AvatarFallback>
                  {formatAvatarFallback(workspace.name)}
                </AvatarFallback>
              </Avatar>
            )
          )}

          <div className="flex flex-col gap-1 flex-1 min-w-0 md:gap-2">
            <span className="text-xl md:text-2xl font-normal truncate">
              {isLoadingWorkspace ? (
                <Skeleton size="text" className="w-30" />
              ) : (
                isSuccessWorkspace && workspace.name
              )}
            </span>
            <span className="text-muted-foreground text-xs md:text-sm truncate">
              {isLoadingWorkspace ? (
                <Skeleton size="text" className="w-50" />
              ) : (
                isSuccessWorkspace && `created by ${workspace.owner.name}`
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkspaceAnalytics() {
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    isSuccess: isSuccessAnalytics,
    isRefetching,
    refetch,
  } = useWorkspaceAnalyticsQuery();
  if (isErrorAnalytics && !isRefetching)
    return (
      <ErrorCard
        className="h-[116px]"
        title="Failed to load analytics"
        onRetry={() => refetch()}
      />
    );

  const isLoading = isLoadingAnalytics || (isErrorAnalytics && isRefetching);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto max-w-full gap-4 snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 5 }, (_, idx) => (
              <AnalyticSkeletonCard key={idx} />
            ))
          : isSuccessAnalytics && (
              <>
                <AnalyticCard
                  title="Total Tasks"
                  value={analytics.tasksCount}
                  difference={analytics.differenceTasksCount}
                />
                <AnalyticCard
                  title="Assigned Tasks"
                  value={analytics.assigneeTasksCount}
                  difference={analytics.differenceAssigneeTasksCount}
                />
                <AnalyticCard
                  title="Completed Tasks"
                  value={analytics.completedTasksCount}
                  difference={analytics.differenceCompletedTasksCount}
                />
                <AnalyticCard
                  title="Incomplete Tasks"
                  value={analytics.incompleteTasksCount}
                  difference={analytics.differenceIncompleteTasksCount}
                />
                <AnalyticCard
                  title="Overdue Tasks"
                  value={analytics.overDueTasksCount}
                  difference={analytics.differenceOverDueTasksCount}
                />
              </>
            )}
      </div>
    </div>
  );
}
