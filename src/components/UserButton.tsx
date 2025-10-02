'use client';

import useAuth from '@/features/auth/hooks/useAuth';
import useSignOut from '@/features/auth/hooks/useSignOut';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { GoSignOut } from 'react-icons/go';
import { HiOutlineUser } from 'react-icons/hi';
import ThemeSwitcher from './ThemeSwitcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          autoHeight
          className={cn(
            'flex items-center gap-2 w-[160px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 py-1 px-2 transition-colors rounded-lg',
            triggerClassName
          )}
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-xs">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user?.profile.avatarImageUrl} alt={user?.name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className="font-semibold capitalize line-clamp-1 text-ellipsis"
              title={user?.name}
            >
              {user?.name}
            </span>
            <span
              className="text-xs text-muted-foreground line-clamp-1 text-ellipsis"
              title={user?.email}
            >
              {user?.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />
        <ThemeSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <HiOutlineUser />
            <span>profile</span>
          </Link>
        </DropdownMenuItem>
        <SignoutAlertDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <GoSignOut />
              <span>sign out</span>
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignoutAlertDialog({ trigger }: { trigger: ReactNode }) {
  const { signOut, isSigningOut } = useSignOut();
  const [open, setOpen] = useState(false);

  const handleSignout = () => {
    setOpen(false);
    signOut();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={isSigningOut}>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure want sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            After logout you need to input your detail to get back this app
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignout} variant="destructive">
            Signout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
