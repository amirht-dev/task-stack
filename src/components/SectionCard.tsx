'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

export const SectionCard = (props: ComponentProps<typeof Card>) => {
  return <Card {...props} className={cn('p-5', props.className)} />;
};

export function SectionCardRow(props: ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('flex items-start gap-6', props.className)} />
  );
}

export function SectionCardHeader(props: ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      {...props}
      className={cn(
        'border-none max-w-lg w-full flex flex-col p-0 items-start',
        props.className
      )}
    />
  );
}

export function SectionCardTitle(props: ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      {...props}
      className={cn('text-xl font-normal', props.className)}
    />
  );
}

export function SectionCardDescription(
  props: ComponentProps<typeof CardDescription>
) {
  return <CardDescription {...props} />;
}

export function SectionCardContent(props: ComponentProps<typeof CardContent>) {
  return (
    <CardContent {...props} className={cn('flex-1 p-0', props.className)} />
  );
}

export function SectionCardFooter(props: ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      {...props}
      className={cn(
        'flex-row-reverse mt-3 px-0 pt-4 min-h-auto',
        props.className
      )}
    />
  );
}

export function SectionCardFormActionButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const {
    formState: { isSubmitting, isDirty, isLoading },
  } = useFormContext();

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !isDirty || isLoading}
      {...props}
    >
      {children ?? 'Update'}
    </Button>
  );
}
