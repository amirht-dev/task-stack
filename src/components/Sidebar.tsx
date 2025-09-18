'use client';

import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher';
import useIsActiveLink from '@/hooks/useIsActiveLink';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';
import { GoHome, GoHomeFill } from 'react-icons/go';
import Logo from './Logo';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const navigationItems = [
  {
    label: 'Home',
    href: '/',
    icon: { disactive: <GoHome />, active: <GoHomeFill /> },
  },
];

export default function Sidebar() {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);
  const toggleSidebar = useGlobalStore((store) => store.toggleSidebar);

  const isExpanded = sidebarStatus === 'expanded';

  return (
    <aside
      className={cn(
        'bg-white shrink-0 border-e border-neutral-200 transition-all',
        isExpanded ? 'w-[264px]' : 'w-[70px]'
      )}
    >
      <div
        className={cn(
          'px-4 flex items-center h-16',
          isExpanded ? 'justify-between' : 'justify-center'
        )}
      >
        <Logo
          variant={isExpanded ? 'icon-text' : 'icon'}
          className={cn('shrink-0', isExpanded ? 'w-[120px]' : 'w-8')}
        />
        {isExpanded && (
          <Button
            mode="icon"
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
          >
            <ArrowLeftToLine />
          </Button>
        )}
      </div>

      <Separator />

      <div className="px-4 py-5 space-y-3 flex flex-col">
        {!isExpanded && (
          <Button
            mode="icon"
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="mx-auto"
          >
            <ArrowRightToLine />
          </Button>
        )}

        <SidebarGroup title="workspace">
          {isExpanded && <WorkspaceSwitcher />}
        </SidebarGroup>

        <SidebarGroup title="general">
          <nav>
            <ul
              className={cn(
                'space-y-1',
                !isExpanded && 'flex flex-col items-center'
              )}
            >
              {navigationItems.map(
                ({ label, href, icon: { disactive, active } }, idx) => {
                  return (
                    <li key={idx}>
                      <SidebarNavLink
                        label={label}
                        href={href}
                        activeIcon={active}
                        disactiveIcon={disactive}
                      />
                    </li>
                  );
                }
              )}
            </ul>
          </nav>
        </SidebarGroup>
      </div>
    </aside>
  );
}

type SidebarGroupProps = PropsWithChildren<{
  title: string;
}>;

function SidebarGroup({ children, title }: SidebarGroupProps) {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);

  const isExpanded = sidebarStatus === 'expanded';

  return (
    <div className="space-y-1">
      <span
        className={cn(
          'uppercase text-xs text-neutral-400',
          !isExpanded && 'hidden'
        )}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

type SidebarNavLinkProps = {
  label: string;
  href: string;
  disactiveIcon: ReactNode;
  activeIcon: ReactNode;
};

const SidebarNavLink = ({
  label,
  href,
  disactiveIcon,
  activeIcon,
}: SidebarNavLinkProps) => {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);
  const isActive = useIsActiveLink(href);

  const isExpanded = sidebarStatus === 'expanded';

  if (isExpanded)
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1 font-semibold text-sm p-2 rounded-md transition-colors',
          isActive
            ? 'bg-neutral-200 text-neutral-950'
            : 'text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100'
        )}
      >
        <Slot className="size-4 shrink-0">
          {isActive ? activeIcon : disactiveIcon}
        </Slot>

        {isExpanded && <span>{label}</span>}
      </Link>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'foreground' : 'ghost'}
          mode="icon"
          className={isActive ? 'bg-neutral-200' : ''}
          asChild
        >
          <Link href={href}>
            <Slot className="size-4 shrink-0">
              {isActive ? activeIcon : disactiveIcon}
            </Slot>
          </Link>
        </Button>
      </TooltipTrigger>

      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};
