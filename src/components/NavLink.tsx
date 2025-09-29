'use client';

import useIsActiveLink from '@/hooks/useIsActiveLink';
import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';
import { OverrideProperties } from 'type-fest';

type CallableWithContext<T> = T | ((context: { isActive: boolean }) => T);

type LinkProps = ComponentProps<typeof Link>;

type NavLinkProps = OverrideProperties<
  LinkProps,
  {
    children?: CallableWithContext<ReactNode>;
    style?: CallableWithContext<LinkProps['style']>;
    className?: CallableWithContext<LinkProps['className']>;
  }
> & {
  basePath?: string;
};

function NavLink({
  children,
  style,
  className,
  basePath = '/',
  ...props
}: NavLinkProps) {
  const isActive = useIsActiveLink(props.href.toString(), basePath);

  const handleCallable = <T extends ReactNode | object>(
    prop: CallableWithContext<T>
  ) => {
    return typeof prop === 'function' ? prop({ isActive }) : prop;
  };

  return (
    <Link
      {...props}
      data-state={isActive ? 'active' : 'disactive'}
      style={handleCallable(style)}
      className={handleCallable(className)}
    >
      {handleCallable(children)}
    </Link>
  );
}

export default NavLink;
