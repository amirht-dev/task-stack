import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef } from 'react';
import { Except, Merge } from 'type-fest';
import { Separator } from './ui/separator';

type LabeledSeparatorOwnProps = {
  label: string;
  separatorClassName?: string;
  labelClassName?: string;
};

type LabeledSeparatorProps = Merge<
  Except<ComponentPropsWithoutRef<typeof Separator>, 'orientation'>,
  LabeledSeparatorOwnProps
>;

const LabeledSeparator = ({
  label,
  className,
  separatorClassName,
  labelClassName,
  ...props
}: LabeledSeparatorProps) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Separator className={cn('flex-1', separatorClassName)} {...props} />
      <span
        className={cn(
          'leading-none text-neutral-500 uppercase text-xs',
          labelClassName
        )}
      >
        {label}
      </span>
      <Separator className={cn('flex-1', separatorClassName)} {...props} />
    </div>
  );
};

export default LabeledSeparator;
