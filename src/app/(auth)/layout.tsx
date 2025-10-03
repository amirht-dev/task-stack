const Layout = ({ children }: LayoutProps<'/'>) => {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-background max-w-screen overflow-x-hidden container">
      {children}
    </div>
  );
};

export default Layout;
