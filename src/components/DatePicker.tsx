'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { Merge } from 'type-fest';

export type DatePickerProps = Merge<
  React.ComponentProps<'input'>,
  {
    defaultValue?: string | number | Date;
    value?: string | number | Date;
    onValueChange?: (value: Date) => void;
    onReset?: () => void;
  }
>;

export default function DatePicker({
  defaultValue,
  value,
  placeholder = 'Pick a date',
  onValueChange,
  onReset,
  ...props
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | string | number | undefined>(
    defaultValue
  );

  const resolvedValue = value ?? date;

  const resolvedDate = resolvedValue ? new Date(resolvedValue) : undefined;

  const handleReset = (e: React.MouseEvent<HTMLElement>) => {
    setDate(undefined);
    e.preventDefault();
    onReset?.();
  };

  const handleSelect = (date: Date) => {
    if (onValueChange) onValueChange(date);
    else setDate(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            mode="input"
            placeholder={!resolvedDate}
            className="w-full"
          >
            <input type="date" hidden placeholder={placeholder} {...props} />
            <CalendarIcon />
            {resolvedDate ? (
              format(resolvedDate, 'PPP')
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
          {resolvedDate && (
            <Button
              type="button"
              variant="dim"
              size="sm"
              className="absolute top-1/2 -end-0 -translate-y-1/2"
              onClick={handleReset}
            >
              <X />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          required
          mode="single"
          selected={resolvedDate}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
