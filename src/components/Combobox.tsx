'use client';

import { Button, ButtonArrow } from '@/components/ui/button';
import {
  Command,
  CommandCheck,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { OneOrMore } from '@/types/utils';
import * as React from 'react';
import { twJoin } from 'tailwind-merge';
import { Merge } from 'type-fest';

export type ComboboxValueType = { value: string; label: string };

type ComboboxContextType = {
  open: boolean;
  setOpen:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((open: boolean) => void);
  options: ComboboxProps['options'];
} & (
  | {
      multiple: true;
      value: string[];
      setValue: (value: string[]) => void;
    }
  | {
      multiple: false;
      value: string;
      setValue: (value: string) => void;
    }
);

const ComboboxContext = React.createContext<ComboboxContextType | null>(null);

const useComboboxContext = () => {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx)
    throw new Error(
      'useComboboxContext must be inside ComboboxContextProvider'
    );
  return ctx;
};

type ComboboxProps = (React.ComponentProps<typeof Popover> & {
  options: ComboboxValueType[];
}) &
  (
    | {
        multiple: true;
        value?: string[];
        onValueChange?: (value: string[]) => void;
      }
    | {
        multiple?: false;
        value?: string;
        onValueChange?: (value: string) => void;
      }
  );

const Combobox = ({ options, ...props }: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>('');
  const [values, setValues] = React.useState<string[]>([]);

  return (
    <ComboboxContext.Provider
      value={{
        open: props.open ?? open,
        setOpen: props.onOpenChange ?? setOpen,
        options,
        ...(props.multiple
          ? {
              multiple: props.multiple,
              value: props.value ?? values,
              setValue: props.onValueChange ?? setValues,
            }
          : {
              multiple: props.multiple ?? false,
              value: props.value ?? value,
              setValue: props.onValueChange ?? setValue,
            }),
      }}
    >
      <Popover open={open} onOpenChange={setOpen} {...props} />
    </ComboboxContext.Provider>
  );
};

const ComboboxTrigger = ({
  children,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { open } = useComboboxContext();
  return (
    <PopoverTrigger asChild {...props}>
      <Button
        variant="outline"
        role="combobox"
        mode="input"
        aria-expanded={open}
        {...props}
      >
        <span className="flex-1 min-w-0 flex justify-start">{children}</span>

        <ButtonArrow
          className={twJoin(
            'transition-transform shrink-0',
            open ? 'rotate-180' : 'rotate-0'
          )}
        />
      </Button>
    </PopoverTrigger>
  );
};

type ComboboxValueProps = React.ComponentProps<'span'> & {
  placeholder?: string;
  renderLabel?: (option: OneOrMore<ComboboxValueType>) => React.ReactNode;
};

const ComboboxValue = ({
  placeholder,
  children,
  renderLabel,
  ...props
}: ComboboxValueProps) => {
  const { value, multiple, options } = useComboboxContext();

  let content;

  if (multiple) {
    const selectedOptions = options.filter((option) =>
      value.some((val) => val === option.value)
    );

    content = !!selectedOptions.length ? (
      renderLabel?.(selectedOptions) ??
      children ??
      selectedOptions.map((option) => option.label).join(', ')
    ) : (
      <span className="text-muted-foreground">{placeholder}</span>
    );
  } else {
    const selectedOption = options.find((option) => option.value === value);

    content = selectedOption ? (
      renderLabel?.(selectedOption) ?? children ?? selectedOption.label
    ) : (
      <span className="text-muted-foreground">{placeholder}</span>
    );
  }

  return (
    <span {...props} className={cn('truncate', props.className)}>
      {content}
    </span>
  );
};

const ComboboxContent = ({
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) => {
  return (
    <PopoverContent
      {...props}
      className={cn('w-(--radix-popper-anchor-width) p-0', props.className)}
    >
      <Command>{children}</Command>
    </PopoverContent>
  );
};

const ComboboxInput = CommandInput;

const ComboboxList = CommandList;

const ComboboxListEmpty = CommandEmpty;

const ComboboxListGroup = CommandGroup;

const ComboboxListItemContext = React.createContext<{
  value: string;
} | null>(null);

const useComboboxListItemContext = () => {
  const ctx = React.useContext(ComboboxListItemContext);
  if (!ctx)
    throw new Error(
      'useComboboxListItemContext must be inside ComboboxListItemContextProvider'
    );
  return ctx;
};

type ComboboxListItemProps = Merge<
  React.ComponentProps<typeof CommandItem>,
  { value: string }
>;

const ComboboxListItem = ({
  children,
  onSelect,
  ...props
}: ComboboxListItemProps) => {
  const ctx = useComboboxContext();

  const handleSelect = (value: string) => {
    if (ctx.multiple) {
      const newValues = ctx.value.slice();
      const valueIndex = ctx.value.indexOf(value);
      if (valueIndex === -1) newValues.push(value);
      else newValues.splice(valueIndex, 1);
      ctx.setValue(newValues);
    } else {
      ctx.setValue(value);
      ctx.setOpen(false);
    }
    onSelect?.(value);
  };

  return (
    <CommandItem {...props} onSelect={handleSelect}>
      <ComboboxListItemContext.Provider value={{ value: props.value }}>
        {children}
      </ComboboxListItemContext.Provider>
    </CommandItem>
  );
};

type ComboboxListItemIndicatorProps = React.ComponentProps<'span'> & {
  position?: 'left' | 'right';
};

const ComboboxListItemIndicator = ({
  children,
  position = 'right',
  ...props
}: ComboboxListItemIndicatorProps) => {
  const { value: selectedValue } = useComboboxContext();
  const { value: itemValue } = useComboboxListItemContext();

  const isSelected = Array.isArray(selectedValue)
    ? selectedValue.includes(itemValue)
    : selectedValue === itemValue;

  return (
    <span
      {...props}
      className={cn(
        isSelected ? 'opacity-100' : 'opacity-0',
        position === 'left' ? 'ms-0' : 'ms-auto',
        props.className
      )}
    >
      {children ?? <CommandCheck />}
    </span>
  );
};

const ComboboxSeparator = CommandSeparator;

export {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxListEmpty,
  ComboboxListGroup,
  ComboboxListItem,
  ComboboxListItemIndicator,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
};
