import useIsTablet from '@/hooks/useIsTablet';
import {
  ComponentProps,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import DialogContent, {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

type Mode = 'dialog' | 'drawer';

const ResponsibleModalContext = createContext<{
  resolvedMode: Mode;
} | null>(null);

const useResponsibleModalContext = () => {
  const ctx = useContext(ResponsibleModalContext);
  if (!ctx)
    throw new Error(
      'useResponsibleModalContext must be inside ResponsibleModalContext'
    );
  return ctx;
};

type ResponsibleModalProps = PropsWithChildren<{
  defaultOpen?: boolean;
  open?: boolean;
  force?: Mode;
  onOpenChange?: (open: boolean) => void;
}>;

const ResponsibleModal = ({
  defaultOpen = false,
  open,
  force,
  children,
  onOpenChange,
}: ResponsibleModalProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isTablet = useIsTablet();

  const isOpen = open ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  const resolvedMode: Mode = force ?? isTablet ? 'dialog' : 'drawer';

  const Comp = resolvedMode === 'dialog' ? Dialog : Drawer;

  return (
    <Comp
      defaultOpen={defaultOpen}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <ResponsibleModalContext.Provider value={{ resolvedMode }}>
        {children}
      </ResponsibleModalContext.Provider>
    </Comp>
  );
};

const ResponsibleModalTrigger = (
  props: ComponentProps<typeof DialogTrigger> &
    ComponentProps<typeof DrawerTrigger>
) => {
  const { resolvedMode } = useResponsibleModalContext();

  const Trigger = resolvedMode === 'dialog' ? DialogTrigger : DrawerTrigger;

  return <Trigger {...props} />;
};

const ResponsibleModalContent = (
  props: ComponentProps<typeof DialogContent> &
    ComponentProps<typeof DrawerContent>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Content = resolvedMode === 'dialog' ? DialogContent : DrawerContent;
  return <Content {...props} />;
};

const ResponsibleModalHeader = (
  props: ComponentProps<typeof DialogHeader> &
    ComponentProps<typeof DrawerHeader>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Header = resolvedMode === 'dialog' ? DialogHeader : DrawerHeader;
  return <Header {...props} />;
};

const ResponsibleModalTitle = (
  props: ComponentProps<typeof DialogTitle> & ComponentProps<typeof DrawerTitle>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Title = resolvedMode === 'dialog' ? DialogTitle : DrawerTitle;
  return <Title {...props} />;
};

const ResponsibleModalDescription = (
  props: ComponentProps<typeof DialogDescription> &
    ComponentProps<typeof DrawerDescription>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Description =
    resolvedMode === 'dialog' ? DialogDescription : DrawerDescription;
  return <Description {...props} />;
};

const ResponsibleModalFooter = (
  props: ComponentProps<typeof DialogFooter> &
    ComponentProps<typeof DrawerFooter>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Footer = resolvedMode === 'dialog' ? DialogFooter : DrawerFooter;
  return <Footer {...props} />;
};

const ResponsibleModalClose = (
  props: ComponentProps<typeof DialogClose> & ComponentProps<typeof DrawerClose>
) => {
  const { resolvedMode } = useResponsibleModalContext();
  const Close = resolvedMode === 'dialog' ? DialogClose : DrawerClose;
  return <Close {...props} />;
};

export {
  ResponsibleModal,
  ResponsibleModalClose,
  ResponsibleModalContent,
  ResponsibleModalDescription,
  ResponsibleModalFooter,
  ResponsibleModalHeader,
  ResponsibleModalTitle,
  ResponsibleModalTrigger,
};
