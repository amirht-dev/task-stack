'use client';

import { useGlobalStore } from '@/contexts/GlobalStoreContext';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import useProjectsQuery from '@/features/projects/hooks/useProjectsQuery';
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher';
import useSelectWorkspace from '@/features/workspaces/hooks/useSelectWorkspace';
import useIsActiveLink from '@/hooks/useIsActiveLink';
import useIsDesktop from '@/hooks/useIsDesktop';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ComponentProps,
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from 'react';
import { BsPlusCircleFill } from 'react-icons/bs';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { HiOutlineUser, HiUser } from 'react-icons/hi2';
import { MdOutlineWorkspaces, MdWorkspaces } from 'react-icons/md';
import Logo from '../Logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const SheetSidebarContext = createContext<{
  isOpen: boolean;
  toggleOpen: () => void;
} | null>(null);

const WorkspaceFormDialog = dynamic(
  () => import('@/features/workspaces/components/WorkspaceFormDialog'),
  { ssr: false }
);

const navigationItems = [
  {
    label: 'Workspaces',
    href: '/workspaces',
    icon: { disactive: <MdOutlineWorkspaces />, active: <MdWorkspaces /> },
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: { disactive: <HiOutlineUser />, active: <HiUser /> },
  },
];

type SidebarGroupProps = PropsWithChildren<{
  title: string;
  action?: ReactNode;
}>;

function SidebarGroup({ children, action, title }: SidebarGroupProps) {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);

  const isExpanded = sidebarStatus === 'expanded';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'uppercase text-xs text-neutral-400',
            !isExpanded && 'hidden'
          )}
        >
          {title}
        </span>

        {action}
      </div>
      {children}
    </div>
  );
}

type SidebarNavLinkProps = {
  label: string;
  href: string;
  basePath?: string;
  disactiveIcon?: ReactNode;
  activeIcon?: ReactNode;
  collapsable?: boolean;
  icon?: ReactNode;
};

const SidebarNavLink = ({
  label,
  href,
  basePath,
  disactiveIcon,
  activeIcon,
  collapsable = false,
  icon,
}: SidebarNavLinkProps) => {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);
  const isActive = useIsActiveLink(href, basePath);
  const { toggleOpen } = useContext(SheetSidebarContext) ?? {};

  const isExpanded = sidebarStatus === 'expanded';

  if ((collapsable && isExpanded) || !collapsable)
    return (
      <Button
        className="block justify-start shadow-none"
        variant={isActive ? 'primary' : 'secondary'}
        asChild
      >
        <Link
          href={href}
          className={cn('flex items-center font-semibold transition-colors')}
          onNavigate={toggleOpen}
        >
          <Slot className="size-4 shrink-0">
            {icon ?? (isActive ? activeIcon : disactiveIcon)}
          </Slot>

          <span>{label}</span>
        </Link>
      </Button>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'primary' : 'secondary'}
          mode="icon"
          asChild
        >
          <Link href={href}>
            <Slot className="size-4 shrink-0">
              {icon ?? (isActive ? activeIcon : disactiveIcon)}
            </Slot>
          </Link>
        </Button>
      </TooltipTrigger>

      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

const SidebarRoot = ({ className, ...props }: ComponentProps<'aside'>) => {
  return (
    <aside
      {...props}
      className={cn('bg-secondary text-secondary-foreground', className)}
    />
  );
};

const SidebarHeader = ({
  collapsable,
  onClose,
}: {
  collapsable: boolean;
  onClose: () => void;
}) => {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);

  return (
    <div
      className={cn(
        'px-4 flex items-center h-16',
        collapsable
          ? sidebarStatus === 'expanded'
            ? 'justify-between'
            : 'justify-center'
          : 'justify-between'
      )}
    >
      <Logo
        variant={
          collapsable
            ? sidebarStatus === 'expanded'
              ? 'icon-text'
              : 'icon'
            : 'icon-text'
        }
        className={cn(
          'shrink-0',
          collapsable
            ? sidebarStatus === 'expanded'
              ? 'w-[120px]'
              : 'w-8'
            : 'w-[120px]'
        )}
      />
      {(!collapsable || (collapsable && sidebarStatus === 'expanded')) && (
        <Button mode="icon" variant="outline" size="sm" onClick={onClose}>
          {collapsable ? <ArrowLeftToLine /> : <GoSidebarExpand />}
        </Button>
      )}
    </div>
  );
};

const SidebarContent = ({ className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn('px-4 py-5 gap-5 flex flex-col', className)}
    />
  );
};

const SidebarWorkspaceSwitcher = () => {
  return (
    <SidebarGroup
      title="workspace"
      action={
        <WorkspaceFormDialog
          trigger={
            <button>
              <BsPlusCircleFill className="size-4 text-neutral-400 hover:text-neutral-500 transition-colors" />
            </button>
          }
        />
      }
    >
      <WorkspaceSwitcher />
    </SidebarGroup>
  );
};

const SidebarNavigation = ({ collapsable }: { collapsable: boolean }) => {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);

  return (
    <SidebarGroup title="general">
      <nav>
        <ul
          className={cn(
            'space-y-1',
            collapsable &&
              sidebarStatus === 'collapsed' &&
              'flex flex-col items-center'
          )}
        >
          {navigationItems.map(
            ({ label, href, icon: { disactive, active } }, idx) => {
              return (
                <li key={idx}>
                  <SidebarNavLink
                    collapsable={collapsable}
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
  );
};

const SidebarWorkspaceProjects = ({
  collapsable,
}: {
  collapsable: boolean;
}) => {
  const { selectedWorkspace } = useSelectWorkspace();
  const { data: projects, isLoading, isSuccess } = useProjectsQuery();
  const sidebarStatus = useGlobalStore((state) => state.sidebarState);

  if (!selectedWorkspace) return;

  return (
    <SidebarGroup
      title="projects"
      action={
        <CreateProjectModal
          trigger={
            (!collapsable || (collapsable && sidebarStatus === 'expanded')) && (
              <button>
                <BsPlusCircleFill className="size-4 text-neutral-400 hover:text-neutral-500 transition-colors" />
              </button>
            )
          }
        />
      }
    >
      <div>
        {isLoading
          ? Array.from({ length: 5 }, (_, idx) => (
              <div className="flex items-center gap-2 px-2 h-8.5" key={idx}>
                <Skeleton size="box" className="size-5 rounded-full" />
                <span>
                  <Skeleton size="text" className="w-20 text-xs" />
                </span>
              </div>
            ))
          : isSuccess &&
            projects.map((project) => (
              <SidebarNavLink
                key={project.$id}
                label={project.name}
                href={`/workspaces/${project.workspaceId}/projects/${project.$id}`}
                collapsable={collapsable}
                icon={
                  <Avatar>
                    <AvatarImage src={project.image?.url} alt={project.name} />
                    <AvatarFallback>{project.name.at(0)}</AvatarFallback>
                  </Avatar>
                }
              />
            ))}
      </div>
    </SidebarGroup>
  );
};

const CollapsableSidebar = () => {
  const sidebarStatus = useGlobalStore((store) => store.sidebarState);
  const toggleSidebar = useGlobalStore((store) => store.toggleSidebar);
  const isDesktop = useIsDesktop();

  if (!isDesktop) return;

  const isExpanded = sidebarStatus === 'expanded';

  return (
    <SidebarRoot
      className={cn(
        'shrink-0 transition-all border-e border-neutral-200 dark:border-neutral-700',
        isExpanded ? 'w-[264px]' : 'w-[70px]'
      )}
    >
      <SidebarHeader collapsable onClose={toggleSidebar} />

      <Separator />

      <SidebarContent>
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
        {isExpanded && <SidebarWorkspaceSwitcher />}
        <Separator />
        <SidebarNavigation collapsable />
        <Separator />
        <SidebarWorkspaceProjects collapsable />
      </SidebarContent>
    </SidebarRoot>
  );
};

const SheetSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <SheetSidebarContext.Provider
      value={{ isOpen: open, toggleOpen: () => setOpen((p) => !p) }}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button mode="icon" variant="outline" size="md">
            <GoSidebarCollapse />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" close={false} className="p-0 w-2xs">
          <SheetTitle className="sr-only">sidebar</SheetTitle>

          <SidebarRoot className="h-full">
            <SheetHeader>
              <SidebarHeader
                collapsable={false}
                onClose={() => setOpen(false)}
              />
            </SheetHeader>
            <Separator />
            <SidebarContent>
              <SidebarWorkspaceSwitcher />
              <Separator />
              <SidebarNavigation collapsable={false} />
              <Separator />
              <SidebarWorkspaceProjects collapsable={false} />
            </SidebarContent>
          </SidebarRoot>
        </SheetContent>
      </Sheet>
    </SheetSidebarContext.Provider>
  );
};

export { CollapsableSidebar, SheetSidebar };
