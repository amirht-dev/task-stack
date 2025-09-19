'use client';

import UserButton from '@/components/UserButton';
import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import WorkspaceFormDialog from '@/features/workspaces/components/WorkspaceFormDialog';
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher';
import { BsPlusCircle } from 'react-icons/bs';
import { MdOutlineWorkspaces } from 'react-icons/md';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';

const Navbar = () => {
  const sidebarState = useGlobalStore((store) => store.sidebarState);
  return (
    <div className="h-16 bg-white border-b border-neutral-200 flex items-center px-10">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Home</span>
        <span className="text-neutral-600 text-sm text-nowrap">
          Monitor all your projects and tasks here
        </span>
      </div>

      {sidebarState === 'collapsed' && (
        <WorkspaceSwitcher classname="ms-4 max-w-[250px]" />
      )}

      <div className="ms-auto flex gap-2 items-center">
        <AddNewDropdownMenu />
        <Separator orientation="vertical" className="h-10" />
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;

function AddNewDropdownMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <BsPlusCircle className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        <WorkspaceFormDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MdOutlineWorkspaces />
              <span>add new workspace</span>
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
