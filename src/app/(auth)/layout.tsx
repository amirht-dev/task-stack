import { NextLayout } from '@/types/next';

const Layout: NextLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-neutral-200">
      {children}
    </div>
  );
};

export default Layout;
