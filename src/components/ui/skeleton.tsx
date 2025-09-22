'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';
import { Merge } from 'type-fest';

type SkeletonProps = Merge<
  React.ComponentProps<'div'>,
  {
    loading?: boolean;
    size?: 'text' | 'box';
  }
>;

function Skeleton({
  className,
  loading = true,
  size = 'box',
  children,
  ...props
}: SkeletonProps) {
  if (loading)
    return (
      <div
        ref={(ref) => {
          if (!ref) return;
          const { lineHeight } = getComputedStyle(ref);
          ref.style.height = lineHeight;
        }}
        data-slot="skeleton"
        className={cn(
          'animate-pulse rounded-md bg-accent',
          size === 'text' ? 'h-(--height)' : 'h-full',
          className
        )}
        {...props}
      />
    );

  return children;
}

export { Skeleton };
