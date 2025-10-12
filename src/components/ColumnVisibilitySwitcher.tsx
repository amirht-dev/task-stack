import { Table } from '@tanstack/react-table';
import { Columns3 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { DataGridColumnVisibility } from './ui/data-grid-column-visibility';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ColumnVisibilitySwitcher({ table }: { table: Table<any> }) {
  const visibleColumnsCount = useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => column.getCanHide() && column.getIsVisible())
        .length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.getState().columnVisibility]
  );

  return (
    <DataGridColumnVisibility
      table={table}
      trigger={
        <Button variant="outline">
          <Columns3 />
          <span className="text-xs dark:bg-secondary dark:text-secondary-foreground bg-secondary flex items-center justify-center text-secondary-foreground size-5 rounded">
            {visibleColumnsCount}
          </span>
        </Button>
      }
    />
  );
}

export default ColumnVisibilitySwitcher;
