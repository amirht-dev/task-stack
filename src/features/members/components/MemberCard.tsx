import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type MemberCardProps = {
  avatar?: string;
  name: string;
};

function MemberCard({ avatar, name }: MemberCardProps) {
  return (
    <Card className="w-[120px]">
      <CardContent className="flex flex-col items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.at(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xs truncate w-full text-center" title={name}>
          {name}
        </CardTitle>
      </CardContent>
    </Card>
  );
}

export default MemberCard;

export function MemberCardSkeleton() {
  return (
    <Card className="w-[120px]">
      <CardContent className="flex flex-col items-center gap-4">
        <Skeleton size="box" className="size-12 rounded-full" />
        <CardTitle className="text-xs">
          <Skeleton size="text" className="w-20" />
        </CardTitle>
      </CardContent>
    </Card>
  );
}
