import { Badge } from '@/components/ui/badge';
import { taskStatusColorClassName } from '../constants';
import { TaskStatus } from '../types';

export type TaskStatusBadgeProps = {
  status: TaskStatus;
};

const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  return <Badge className={taskStatusColorClassName[status]}>{status}</Badge>;
};

export default TaskStatusBadge;
