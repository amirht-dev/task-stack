import { usePathname } from 'next/navigation';

function useIsActiveLink(href: string) {
  const pathname = usePathname();
  const isActive =
    (href === '/' && href === pathname) || pathname.startsWith(href);

  return isActive;
}

export default useIsActiveLink;
