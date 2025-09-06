import { cn } from '@/lib/utils';
import { ComponentProps, useId } from 'react';

function GridPattern({ className, ...props }: ComponentProps<'svg'>) {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(
        '[--fg:theme(colors.neutral.200)] [--bg:none] [--zoom:2] [--width:1px]',
        className
      )}
    >
      <defs>
        <pattern
          id={id}
          width="20"
          height="20"
          style={{
            transform: 'scale(var(--zoom))',
          }}
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill="var(--bg)" />
          <path
            fill="none"
            strokeWidth="var(--width)"
            stroke="var(--fg)"
            d="M10 0v20ZM0 10h20Z"
          />
        </pattern>
      </defs>
      <rect width="800%" height="800%" fill={`url(#${id})`} />
    </svg>
  );
}

export default GridPattern;
