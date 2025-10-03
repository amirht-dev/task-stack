import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import SetPasswordAlertDialog from '@/features/auth/components/SetPasswordAlertDialog';
import { protect } from '@/features/auth/utils/server';

const DashboardLayout = async ({ children }: LayoutProps<'/'>) => {
  await protect();

  return (
    <>
      <SetPasswordAlertDialog />
      <div className="h-dvh flex bg-background text-foreground">
        <Sidebar />

        <div className="flex-1 flex flex-col h-full">
          <Navbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
