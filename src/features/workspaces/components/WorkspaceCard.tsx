import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import useWorkspace from '../hooks/useWorkspace';
import { Workspace } from '../types';

type WorkspaceCardProps = {
  workspace: Workspace;
};

function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { userRoles } = useWorkspace(workspace.$id);

  return (
    <Link href={`/workspaces/${workspace.$id}`}>
      <Card className="overflow-hidden">
        <div className="relative h-[100px] bg-red-100">
          {workspace.imageUrl && (
            <Image
              alt={workspace.name}
              src={workspace.imageUrl}
              fill
              className="object-cover object-center"
            />
          )}
        </div>

        <div className="p-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold line-clamp-1" title={workspace.name}>
              {workspace.name}
            </h4>

            <small className="text-muted-foreground text-xs text-nowrap">
              {workspace.members.total} member
              {workspace.members.total > 1 && 's'}
            </small>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {userRoles?.map((role) => (
              <Badge
                key={role}
                appearance="light"
                variant={role === 'owner' ? 'primary' : 'info'}
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default WorkspaceCard;
