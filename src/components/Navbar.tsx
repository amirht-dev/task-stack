'use client';

import UserButton from '@/components/UserButton';
import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher';

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

      <UserButton triggerClassName="ms-auto" />
    </div>
  );
};

export default Navbar;
