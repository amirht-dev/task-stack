'use client';

import AnalyticCard, { AnalyticSkeletonCard } from '@/components/AnalyticCard';
import useProjectAnalyticsQuery from '../hooks/useProjectAnalyticsQuery';

const ProjectAnalytics = () => {
  const {
    data: projectAnalytics,
    isLoading: isLoadingProjectAnalytics,
    isSuccess: isSuccessProjectAnalytics,
  } = useProjectAnalyticsQuery();

  return (
    <div className="w-full">
      {/* <ScrollBar orientation="horizontal" /> */}

      <div className="flex overflow-x-auto max-w-full gap-4 snap-x snap-mandatory">
        {isLoadingProjectAnalytics
          ? Array.from({ length: 5 }, (_, idx) => (
              <AnalyticSkeletonCard key={idx} />
            ))
          : isSuccessProjectAnalytics && (
              <>
                <AnalyticCard
                  title="Total Tasks"
                  value={projectAnalytics.tasksCount}
                  difference={projectAnalytics.differenceTasksCount}
                />
                <AnalyticCard
                  title="Assigned Tasks"
                  value={projectAnalytics.assigneeTasksCount}
                  difference={projectAnalytics.differenceAssigneeTasksCount}
                />
                <AnalyticCard
                  title="Completed Tasks"
                  value={projectAnalytics.completedTasksCount}
                  difference={projectAnalytics.differenceCompletedTasksCount}
                />
                <AnalyticCard
                  title="Incomplete Tasks"
                  value={projectAnalytics.incompleteTasksCount}
                  difference={projectAnalytics.differenceIncompleteTasksCount}
                />
                <AnalyticCard
                  title="Overdue Tasks"
                  value={projectAnalytics.overDueTasksCount}
                  difference={projectAnalytics.differenceOverDueTasksCount}
                />
              </>
            )}
      </div>
    </div>
  );
};

export default ProjectAnalytics;
