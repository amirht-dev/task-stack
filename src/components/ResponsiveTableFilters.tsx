'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input, InputWrapper } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import useIsTablet from '@/hooks/useIsTablet';
import { Table } from '@tanstack/react-table';
import { useDebounce } from '@uidotdev/usehooks';
import { X } from 'lucide-react';
import {
  Children,
  ComponentProps,
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HiOutlineFilter } from 'react-icons/hi';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxListEmpty,
  ComboboxListItem,
  ComboboxListItemIndicator,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxValueType,
} from './Combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ResponsiveTableFilterContext = createContext<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
} | null>(null);

const useResponsiveTableFilterContext = () => {
  const ctx = useContext(ResponsiveTableFilterContext);
  if (!ctx)
    throw new Error(
      'useResponsiveTableFilterContext must be used inside ResponsiveTableFilterContext'
    );
  return ctx;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponsiveTableFilterProps = PropsWithChildren<{ table: Table<any> }>;

function ResponsiveTableFilter({
  table,
  children,
}: ResponsiveTableFilterProps) {
  const [open, setOpen] = useState(false);
  const isTablet = useIsTablet();

  const separatedChildren = Children.map(children, (child, idx) => (
    <>
      {child}
      {idx !== Children.count(children) - 1 && <Separator />}
    </>
  ));

  if (isTablet)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <HiOutlineFilter />
            <span>Filters</span>
            <span className="size-5 bg-secondary text-secondary-foreground rounded">
              {table.getState().columnFilters.length}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end">
          <ResponsiveTableFilterContext.Provider value={{ table }}>
            <div className="space-y-4">{separatedChildren}</div>
          </ResponsiveTableFilterContext.Provider>
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <HiOutlineFilter />
          <span className="size-5 bg-secondary text-secondary-foreground rounded">
            2
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="px-4 pb-4">
        <DrawerHeader className="px-0">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <ResponsiveTableFilterContext.Provider value={{ table }}>
          <div className="space-y-4">{separatedChildren}</div>
        </ResponsiveTableFilterContext.Provider>
      </DrawerContent>
    </Drawer>
  );
}

type TableColumnSearchFilterProps = ComponentProps<typeof Input> & {
  debounceDelay?: number;
  column: string;
};

const TableColumnSearchFilter = ({
  debounceDelay = 500,
  column,
  ...props
}: TableColumnSearchFilterProps) => {
  const { table } = useResponsiveTableFilterContext();
  const _column = useMemo(() => table.getColumn(column), [column, table]);
  const [value, setValue] = useState<string>(() => {
    const filterValue = _column?.getFilterValue();
    return typeof filterValue === 'string' ? filterValue : '';
  });
  const debouncedValue = useDebounce(value, debounceDelay);

  useEffect(() => {
    if (!_column) return;
    if (!value) _column.setFilterValue('');
  }, [value, _column]);

  useEffect(() => {
    _column?.setFilterValue(debouncedValue);
  }, [debouncedValue, _column]);

  const handleClear = () => setValue('');

  return (
    <InputWrapper>
      <Input
        placeholder={`search ${column}...`}
        {...props}
        value={value}
        onChange={(e) => {
          props.onChange?.(e);
          if (e.isDefaultPrevented() || props.disabled) return;

          setValue(e.target.value);
        }}
      />
      {value && (
        <Button
          variant="dim"
          size="icon"
          onClick={handleClear}
          className="size-auto"
        >
          <X size={16} />
        </Button>
      )}
    </InputWrapper>
  );
};

type TableFilterSearchProps = ComponentProps<typeof Input> & {
  debounceDelay?: number;
};

const TableGlobalSearchFilter = ({
  debounceDelay = 500,
  ...props
}: TableFilterSearchProps) => {
  const { table } = useResponsiveTableFilterContext();
  const [value, setValue] = useState<string>(
    () => table.getState().globalFilter
  );
  const debouncedValue = useDebounce(value, debounceDelay);

  useEffect(() => {
    if (!value) table.setGlobalFilter('');
  }, [value, table]);

  useEffect(() => {
    table.setGlobalFilter(debouncedValue);
  }, [debouncedValue, table]);

  const handleClear = () => setValue('');

  return (
    <InputWrapper>
      <Input
        placeholder="search..."
        {...props}
        value={value}
        onChange={(e) => {
          props.onChange?.(e);
          if (e.isDefaultPrevented() || props.disabled) return;

          setValue(e.target.value);
        }}
      />
      {value && (
        <Button
          variant="dim"
          size="icon"
          onClick={handleClear}
          className="size-auto"
        >
          <X size={16} />
        </Button>
      )}
    </InputWrapper>
  );
};

type TableFilterSelectProps<T> = ComponentProps<typeof SelectValue> & {
  column: string;
  renderItem?: (item: NoInfer<T>) => ReactNode;
  options?: T[];
  valuePrefix?: ReactNode;
};

const TableSelectFilter = <T,>({
  column,
  valuePrefix,
  options,
  renderItem,
  ...props
}: TableFilterSelectProps<T>) => {
  const { table } = useResponsiveTableFilterContext();

  const _column = useMemo(() => table.getColumn(column), [column, table]);

  const columnUniqueOptions = useMemo(() => {
    const uniqueValues = _column?.getFacetedUniqueValues()?.keys();
    return uniqueValues ? [...uniqueValues] : [];
  }, [_column]);

  const resolvedOptions = options ?? columnUniqueOptions;

  const handleValueChange = (value: string) => {
    _column?.setFilterValue(value === 'all' ? undefined : value);
  };

  if (!_column) return;

  return (
    <Select
      value={(_column.getFilterValue() as string) ?? 'all'}
      onValueChange={handleValueChange}
    >
      <SelectTrigger>
        <span>
          {valuePrefix}
          <SelectValue {...props} />
        </span>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {resolvedOptions.map((item) => (
          <SelectItem value={String(item)} key={String(item)}>
            {renderItem?.(item) ?? item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type TableFilterComboboxProps<T> = Pick<
  ComponentProps<typeof ComboboxValue>,
  'placeholder'
> & {
  column: string;
  renderItem?: (item: NoInfer<T>) => ReactNode;
  options?: T[];
  valuePrefix?: ReactNode;
  searchInput?:
    | false
    | {
        placeholder?: string;
      };
  indicatorPosition?: 'left' | 'right';
} & (
    | {
        multiple: true;
        renderValueLabel?: (
          item: Array<NoInfer<T> & { api: { remove: () => void } }>
        ) => ReactNode;
      }
    | {
        multiple?: false;
        renderValueLabel?: (item: NoInfer<T>) => ReactNode;
      }
  );

const TableComboboxFilter = <T extends ComboboxValueType>({
  column,
  valuePrefix,
  options,
  searchInput = { placeholder: 'search...' },
  placeholder,
  indicatorPosition = 'right',
  multiple = false,
  renderItem,
  renderValueLabel,
}: TableFilterComboboxProps<T>) => {
  const { table } = useResponsiveTableFilterContext();
  const _column = useMemo(() => table.getColumn(column), [column, table]);

  const columnUniqueOptions = useMemo(() => {
    const uniqueValues = _column
      ?.getFacetedUniqueValues()
      ?.keys()
      .map<ComboboxValueType>((value) => ({ value, label: value }));
    return uniqueValues ? [...uniqueValues] : [];
  }, [_column]);

  const resolvedOptions = options ?? columnUniqueOptions;

  if (!_column) return;

  const indicator = <ComboboxListItemIndicator position={indicatorPosition} />;

  const filterValue = _column.getFilterValue();

  const handleRemoveItem = (value: string) => {
    if (Array.isArray(filterValue))
      _column.setFilterValue(filterValue.filter((filter) => filter !== value));
  };

  return (
    <Combobox
      options={resolvedOptions}
      {...(multiple
        ? {
            multiple,
            value: Array.isArray(filterValue) ? filterValue : [],
            onValueChange(value) {
              if (!Array.isArray(filterValue))
                return _column.setFilterValue(value);

              _column.setFilterValue(
                filterValue.includes(value)
                  ? filterValue.filter((filter) => filter !== value)
                  : value
              );
            },
          }
        : {
            multiple,
            value: typeof filterValue === 'string' ? filterValue : '',
            onValueChange(value) {
              _column.setFilterValue(value);
            },
          })}
    >
      <ComboboxTrigger className="w-full">
        <span>
          {valuePrefix}
          <ComboboxValue
            className="w-full"
            renderLabel={(option) => {
              return renderValueLabel?.(
                (Array.isArray(option)
                  ? option.map((option) => ({
                      ...option,
                      api: { remove: () => handleRemoveItem(option.value) },
                    }))
                  : option) as T & Array<T & { api: { remove: () => void } }>
              );
            }}
            placeholder={placeholder}
          />
        </span>
      </ComboboxTrigger>

      <ComboboxContent>
        {!!searchInput && (
          <ComboboxInput placeholder={searchInput.placeholder} />
        )}
        <ComboboxList>
          <ComboboxListEmpty>No found</ComboboxListEmpty>
          {resolvedOptions.map((option) => (
            <ComboboxListItem key={option.value} value={option.value}>
              {indicatorPosition === 'left' && indicator}
              {renderItem?.(option as T) ?? option.value}
              {indicatorPosition === 'right' && indicator}
            </ComboboxListItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export {
  ResponsiveTableFilter,
  TableColumnSearchFilter,
  TableComboboxFilter,
  TableGlobalSearchFilter,
  TableSelectFilter,
};
