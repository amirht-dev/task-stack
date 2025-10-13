import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { taskStatusColorClassName, taskStatusLabelMap } from '../constants';
import { TaskStatus } from '../types';

export type TaskStatusBadgeProps = {
  status: TaskStatus;
  onRemove?: (status: TaskStatus) => void;
};

const TaskStatusBadge = ({ status, onRemove }: TaskStatusBadgeProps) => {
  return (
    <Badge className={taskStatusColorClassName[status]}>
      {taskStatusLabelMap[status]}
      {!!onRemove && (
        <Button
          variant="dim"
          className="size-auto text-[inherit] p-0"
          onClick={() => onRemove(status)}
        >
          <X className="size-2" />
        </Button>
      )}
    </Badge>
  );
};

export default TaskStatusBadge;
