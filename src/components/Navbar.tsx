'use client';

import UserButton from '@/components/UserButton';
import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import WorkspaceFormDialog from '@/features/workspaces/components/WorkspaceFormDialog';
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher';
import useWorkspacesQuery from '@/features/workspaces/hooks/useWorkspacesQuery';
import useIsDesktop from '@/hooks/useIsDesktop';
import { BsPlusCircle } from 'react-icons/bs';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import { MdOutlineWorkspaces } from 'react-icons/md';
import { SheetSidebar } from './layout/Sidebar';
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
  const isDesktop = useIsDesktop();

  return (
    <div className="bg-secondary text-secondary-foreground border-b border-neutral-200 dark:border-neutral-700">
      <div className="container h-16 flex items-center">
        {isDesktop && sidebarState === 'collapsed' && (
          <WorkspaceSwitcher classname="ms-4 max-w-[250px]" />
        )}
        {!isDesktop && <SheetSidebar />}
        <div className="ms-auto flex gap-2 items-center">
          {isDesktop && (
            <>
              <AddNewDropdownMenu />
              <Separator orientation="vertical" className="h-10" />
            </>
          )}
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

function AddNewDropdownMenu() {
  const { data: workspaces } = useWorkspacesQuery();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button mode="icon" size="icon" variant="ghost">
          <BsPlusCircle className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        <WorkspaceFormDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MdOutlineWorkspaces />
              <span>create new workspace</span>
            </DropdownMenuItem>
          }
        />
        <CreateProjectModal
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={!workspaces?.length}
            >
              <HiOutlineViewGridAdd />
              <span>create new project</span>
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
