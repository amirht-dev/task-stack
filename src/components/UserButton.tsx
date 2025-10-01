'use client';

import useAuth from '@/features/auth/hooks/useAuth';
import { GoSignOut } from 'react-icons/go';
import SignoutButton from '../features/auth/components/SignoutButton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import DialogContent, {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';

type UserButtonProps = {
  triggerClassName?: string;
};

export default function UserButton({ triggerClassName }: UserButtonProps) {
  const { user, isUnauthenticated } = useAuth();

  const avatarFallback = user?.name
    ?.split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (isUnauthenticated) return null;

  return (
    <Popover modal={false}>
      <PopoverTrigger className={triggerClassName} disabled={!user} asChild>
        <Button
          variant="ghost"
          autoHeight
          className="flex items-center gap-2 w-[160px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 py-1 px-2 transition-colors rounded-lg"
        >
          {user ? (
            <Avatar className="shrink-0">
              <AvatarImage src={user.profile.avatarImageUrl} alt={user?.name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="rounded-full size-10" />
          )}

          <div className="flex flex-col items-start flex-1 text-start min-w-0 gap-1">
            <span className="font-semibold text-sm capitalize text-ellipsis text-nowrap w-full overflow-hidden">
              {user ? user.name : <Skeleton className="w-3/4 h-[1em]" />}
            </span>
            <span className="text-xs text-muted-foreground text-ellipsis text-nowrap w-full overflow-hidden">
              {user ? user.email : <Skeleton className="w-full h-[1em]" />}
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end">
        <div className="flex flex-col items-center">
          <Avatar className="size-16">
            <AvatarImage src={user?.profile.avatarImageUrl} alt={user?.name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <span className="font-semibold capitalize mt-2">{user?.name}</span>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </div>

        <Separator className="my-4" />

        <div>
          <SignoutDialog />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SignoutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="dim" className="hover:text-destructive">
          <GoSignOut />
          <span>sign out</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Are you sure want sign out?</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <DialogDescription className="text-sm">
            After logout you need to input your detail to get back this app
          </DialogDescription>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <SignoutButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
