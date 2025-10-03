'use client';

import SetPasswordAlertDialog from '@/features/auth/components/SetPasswordAlertDialog';
import useAuth from '@/features/auth/hooks/useAuth';
import useSignOut from '@/features/auth/hooks/useSignOut';
import useIsDesktop from '@/hooks/useIsDesktop';
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
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { Skeleton } from './ui/skeleton';

type UserButtonProps = {
  triggerClassName?: string;
};

export default function UserButton({ triggerClassName }: UserButtonProps) {
  const { user, isAuthenticating, isUnauthenticated } = useAuth();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);

  const avatarFallback = user?.name
    ?.split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (isUnauthenticated) return null;

  const trigger = (
    <Button
      variant="ghost"
      disabled={isAuthenticating}
      autoHeight
      className={cn(
        'flex items-center gap-2 w-auto md:w-[160px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 py-1 px-2 transition-colors rounded-lg',
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

      <div className="hidden md:flex flex-col items-start flex-1 text-start min-w-0 gap-1">
        <span className="font-semibold text-sm capitalize text-ellipsis text-nowrap w-full overflow-hidden">
          {user ? user.name : <Skeleton className="w-3/4 h-[1em]" />}
        </span>
        <span className="text-xs text-muted-foreground text-ellipsis text-nowrap w-full overflow-hidden">
          {user ? user.email : <Skeleton className="w-full h-[1em]" />}
        </span>
      </div>
    </Button>
  );

  if (isDesktop)
    return (
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-xs">
          <UserHeader />

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="max-w-sm w-full bg-secondary text-secondary-foreground"
      >
        <SheetTitle className="sr-only">user profile</SheetTitle>
        <UserHeader />
        <Separator />
        <ThemeSwitcher />
        <Separator />
        <Button variant="ghost" asChild>
          <Link
            href="/profile"
            className="justify-start"
            onNavigate={() => setOpen(false)}
          >
            <HiOutlineUser className="size-4" />
            <span>profile</span>
          </Link>
        </Button>
        <SignoutAlertDialog
          trigger={
            <Button variant="ghost" className="justify-start">
              <GoSignOut />
              <span>sign out</span>
            </Button>
          }
        />
      </SheetContent>
    </Sheet>
  );
}

const UserHeader = () => {
  const { user } = useAuth();
  if (!user) return;

  const avatarFallback = user.name
    ?.split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={user?.profile.avatarImageUrl} alt={user.name} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="font-semibold capitalize line-clamp-1 text-ellipsis"
          title={user.name}
        >
          {user.name}
        </span>
        <span
          className="text-xs text-muted-foreground line-clamp-1 text-ellipsis"
          title={user.email}
        >
          {user.email}
        </span>
      </div>
    </div>
  );
};

function SignoutAlertDialog({ trigger }: { trigger: ReactNode }) {
  const { signOut, isSigningOut } = useSignOut();
  const [open, setOpen] = useState(false);

  const handleSignout = () => {
    setOpen(false);
    signOut();
  };

  return (
    <>
      {open && <SetPasswordAlertDialog onAccept={() => setOpen(false)} />}
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
    </>
  );
}
