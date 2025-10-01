import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { protect } from '@/features/auth/utils/server';
import { NextLayout } from '@/types/next';

const DashboardLayout: NextLayout = async ({ children }) => {
  await protect();

  return (
    <div className="h-dvh flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full">
        <Navbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
