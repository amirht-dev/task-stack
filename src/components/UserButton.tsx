'use client';

import { GoSignOut } from 'react-icons/go';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import DialogContent, {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

type UserButtonProps = {
  triggerClassName?: string;
};

export default function UserButton({ triggerClassName }: UserButtonProps) {
  const name = 'amir hossein';
  const email = 'amirht.dev@gmail.com';

  const avatarFallback = name
    .split(' ')
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <Popover modal={false}>
      <PopoverTrigger className={triggerClassName} asChild>
        <Button
          variant="ghost"
          autoHeight
          className="flex items-center gap-2 w-[160px] cursor-pointer hover:bg-neutral-100 py-1 px-2 transition-colors rounded-lg"
        >
          <Avatar className="shrink-0">
            <AvatarImage src="https://i.pravatar.cc/300" alt={name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start flex-1 text-start min-w-0">
            <span className="font-semibold text-sm capitalize text-neutral-950 text-ellipsis text-nowrap w-full overflow-hidden">
              {name}
            </span>
            <span className="text-xs text-neutral-600 text-ellipsis text-nowrap w-full overflow-hidden">
              {email}
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end">
        <div className="flex flex-col items-center">
          <Avatar className="size-16">
            <AvatarImage src="https://i.pravatar.cc/300" alt={name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <span className="font-semibold text-neutral-950 capitalize mt-2">
            {name}
          </span>
          <span className="text-xs text-neutral-600">{email}</span>
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
          <p className="text-sm">
            After logout you need to input your detail to get back this app
          </p>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button variant="destructive">Sign out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
