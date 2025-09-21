import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Workspace } from '../types';

type WorkspaceCardProps = {
  workspace: Workspace;
};

function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const isOwner = Math.random() > 0.5;

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
            {isOwner && <Badge appearance="light">owner</Badge>}
          </div>

          <small className="text-muted-foreground text-xs">
            {workspace.members.total} member{workspace.members.total > 1 && 's'}
          </small>
        </div>
      </Card>
    </Link>
  );
}

export default WorkspaceCard;
