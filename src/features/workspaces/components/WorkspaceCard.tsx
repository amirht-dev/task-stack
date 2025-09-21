import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { Workspace } from '../types';

type WorkspaceCardProps = {
  workspace: Workspace;
};

function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { user } = useAuthContext();

  const currentUserRoles = workspace.members.memberships.find(
    (member) => member.userId === user?.$id
  )?.roles;

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
            <h4 className="font-semibold">{workspace.name}</h4>

            <small className="text-muted-foreground text-xs">
              {workspace.members.total} member
              {workspace.members.total > 1 && 's'}
            </small>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {currentUserRoles?.map((role) => (
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
