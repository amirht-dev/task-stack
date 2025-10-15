import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardTitle } from './ui/card';

type ErrorCardProps = {
  title?: string;
  onRetry?: () => void;
  className?: string;
};

const ErrorCard = ({
  title = 'Something went wrong!',
  className,
  onRetry,
}: ErrorCardProps) => {
  return (
    <Card className={cn('border-destructive border', className)}>
      <CardContent className="h-full flex items-center flex-col justify-center gap-3">
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle />
          {title}
        </CardTitle>
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
