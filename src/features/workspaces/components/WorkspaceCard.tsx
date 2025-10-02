import { Badge, BadgeSkeleton } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Workspaces } from '../types';
import { formatMembersCount } from '../utils';
import { Skeleton } from '@/components/ui/skeleton';

type WorkspaceCardProps = {
  workspace: Workspaces[number];
};

function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspaces/${workspace.$id}`}>
      <Card className="overflow-hidden h-[178px]">
        <div className="relative h-[100px]">
          {workspace.image && (
            <Image
              alt={workspace.name}
              src={workspace.image.url}
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
              {formatMembersCount(workspace.totalMembers)}
            </small>
          </div>

          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            {workspace.user.roles.map((role) => (
              <Badge
                key={role}
                appearance="light"
                variant={role === 'owner' ? 'primary' : 'info'}
                className="shrink-0"
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

export function WorkspaceCardSkeleton() {
  return (
    <Card className="overflow-hidden h-[178px]">
      <Skeleton size="box" className="relative h-[100px] " />

      <div className="p-2">
        <div className="flex items-center justify-between">
          <h4>
            <Skeleton size="text" className="w-[100px]" />
          </h4>

          <small>
            <Skeleton size="text" className="w-[50px]" />
          </small>
        </div>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          {Array.from({ length: 2 }, (_, idx) => (
            <BadgeSkeleton className="w-15" key={idx} />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default WorkspaceCard;
