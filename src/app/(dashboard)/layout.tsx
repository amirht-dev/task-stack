import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { protect } from '@/features/auth/utils/server';
import { NextLayout } from '@/types/next';

const DashboardLayout: NextLayout = async ({ children }) => {
  await protect();

  return (
    <div className="h-dvh flex">
      <Sidebar />

      <div className="flex-1 bg-neutral-100 overflow-y-auto h-full">
        <Navbar />
        <div className="p-10">
          <div className="bg-white h-[200vh] p-6 rounded-xl">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
