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

type ProjectAnalyticsCardProps = {
  title: string;
  value: number;
  difference: number;
};

const AnalyticCard = ({
  title,
  value,
  difference,
}: ProjectAnalyticsCardProps) => {
  const Icon = difference > 0 ? FaCaretUp : FaCaretDown;

  return (
    <Card className="shrink-0 w-3xs h-[116px] snap-start">
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
            in {format(new Date(), 'MMMM yyy')}
          </span>
        </CardTitle>
      </CardContent>
    </Card>
  );
};

export default AnalyticCard;

export const AnalyticSkeletonCard = () => {
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
