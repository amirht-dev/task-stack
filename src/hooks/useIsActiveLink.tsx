import { usePathname } from 'next/navigation';

function useIsActiveLink(href: string) {
  const pathname = usePathname();
  const isActive =
    href === pathname || (href !== '/' && pathname.startsWith(href));

  return isActive;
}

export default useIsActiveLink;
