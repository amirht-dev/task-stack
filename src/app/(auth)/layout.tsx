import { NextLayout } from '@/types/next';

const Layout: NextLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-background">
      {children}
    </div>
  );
};

export default Layout;
