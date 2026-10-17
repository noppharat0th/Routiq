import type { Column, RowData } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataTableFeatures } from './data-table-features';

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sortDirection = column.getIsSorted();

  return (
    <Button
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(sortDirection === 'asc')}
      type="button"
      variant="ghost"
    >
      {title}
      {sortDirection === 'asc' ? (
        <ArrowUp aria-hidden="true" />
      ) : sortDirection === 'desc' ? (
        <ArrowDown aria-hidden="true" />
      ) : (
        <ArrowUpDown aria-hidden="true" />
      )}
    </Button>
  );
}
