import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import useWorkspaceQuery from '../hooks/useWorkspaceQuery';
import useWorkspaceUserRoles from '../hooks/useWorkspaceUserRoles';
import { formatMembersCount } from '../utils';

type WorkspaceCardProps = {
  workspaceId: string;
};

function WorkspaceCard({ workspaceId }: WorkspaceCardProps) {
  const {
    isLoading,
    isSuccess,
    data: workspace,
  } = useWorkspaceQuery(workspaceId);
  const { roles } = useWorkspaceUserRoles(workspaceId);

  if (isLoading) return 'loading...';

  if (isSuccess)
    return (
      <Link href={`/workspaces/${workspace.$id}`}>
        <Card className="overflow-hidden h-[178px]">
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
                {formatMembersCount(workspace.members.total)}
              </small>
            </div>

            <div className="flex items-center gap-2 mt-3 overflow-x-auto">
              {roles?.map((role) => (
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

export default WorkspaceCard;
