import { usePathname } from 'next/navigation';

function useIsActiveLink(href: string, basePath = '/') {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== basePath && pathname.startsWith(href));
  // href === pathname || (href !== '/' && pathname.startsWith(href));

  return isActive;
}

export default useIsActiveLink;
