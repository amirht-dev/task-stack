import { Table } from '@tanstack/react-table';
import { Columns3 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from './ui/badge';
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
          <Badge size="sm" variant="outline">
            {visibleColumnsCount}
          </Badge>
        </Button>
      }
    />
  );
}

export default ColumnVisibilitySwitcher;
