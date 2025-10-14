'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { twJoin } from 'tailwind-merge';
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
              <ProjectAnalyticSkeletonCard key={idx} />
            ))
          : isSuccessProjectAnalytics && (
              <>
                <ProjectAnalyticCard
                  title="Total Tasks"
                  value={projectAnalytics.tasksCount}
                  difference={projectAnalytics.differenceTasksCount}
                />
                <ProjectAnalyticCard
                  title="Assigned Tasks"
                  value={projectAnalytics.assigneeTasksCount}
                  difference={projectAnalytics.differenceAssigneeTasksCount}
                />
                <ProjectAnalyticCard
                  title="Completed Tasks"
                  value={projectAnalytics.completedTasksCount}
                  difference={projectAnalytics.differenceCompletedTasksCount}
                />
                <ProjectAnalyticCard
                  title="Incomplete Tasks"
                  value={projectAnalytics.incompleteTasksCount}
                  difference={projectAnalytics.differenceIncompleteTasksCount}
                />
                <ProjectAnalyticCard
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

type ProjectAnalyticsCardProps = {
  title: string;
  value: number;
  difference: number;
};

const ProjectAnalyticCard = ({
  title,
  value,
  difference,
}: ProjectAnalyticsCardProps) => {
  const Icon = difference > 0 ? FaCaretUp : FaCaretDown;

  return (
    <Card className="shrink-0 w-3xs snap-start">
      <CardHeader className="border-none">
        <div className="flex items-center gap-4 w-full">
          <CardDescription className="truncate flex-1 capitalize min-w-0">
            {title}
          </CardDescription>
          <div
            className={twJoin(
              'flex items-center gap-1 shrink-0',
              difference > 0 ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            <span className="text-xs">{difference}</span>
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="flex items-baseline gap-2">
          <span>{value}</span>{' '}
          <span className="text-xs text-muted-foreground">
            in {format(new Date(), 'MMMM YYY')}
          </span>
        </CardTitle>
      </CardContent>
    </Card>
  );
};

const ProjectAnalyticSkeletonCard = () => {
  return (
    <Card className="w-3xs">
      <CardHeader className="border-none">
        <div className="flex items-center gap-4">
          <CardDescription className="truncate">
            <Skeleton size="text" className="w-30" />
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle>
          <Skeleton size="text" className="w-10" />
        </CardTitle>
      </CardContent>
    </Card>
  );
};
