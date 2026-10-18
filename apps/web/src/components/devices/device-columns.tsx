import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { NetworkDevice } from '@/models/router.model';
import { DataTableColumnHeader } from '../data-table/DataTableColumnHeader';
import type { DataTableFeatures } from '../data-table/data-table-features';

function formatLease(seconds: number | null): string {
  if (seconds === null) {
    return '-';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
}

const columnHelper = createColumnHelper<DataTableFeatures, NetworkDevice>();

export const deviceColumns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all devices on this page"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(value === true)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name || row.original.macAddress}`}
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean | 'indeterminate') => row.toggleSelected(value === true)}
      />
    ),
  }),
  columnHelper.accessor((device) => device.displayName || device.name || '', {
    id: 'name',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
    cell: ({ row }) => (
      <div>
        <span className="font-medium">
          {row.original.displayName || row.original.name || 'Unknown device'}
        </span>
        {row.original.displayName && row.original.name && (
          <p className="text-muted-foreground text-xs">Router name: {row.original.name}</p>
        )}
      </div>
    ),
  }),
  columnHelper.accessor((device) => device.ipAddress || '', {
    id: 'ipAddress',
    header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
    cell: ({ row }) => row.original.ipAddress || '-',
  }),
  columnHelper.accessor('macAddress', {
    id: 'macAddress',
    header: ({ column }) => <DataTableColumnHeader column={column} title="MAC Address" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.macAddress}</span>,
  }),
  columnHelper.accessor((device) => device.interfaceName || '', {
    id: 'interfaceName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Interface" />,
    cell: ({ row }) =>
      row.original.interfaceName ? (
        <Badge variant="outline">{row.original.interfaceName}</Badge>
      ) : (
        '-'
      ),
  }),
  columnHelper.accessor((device) => device.leaseRemainingSeconds ?? Number.NEGATIVE_INFINITY, {
    id: 'leaseRemainingSeconds',
    enableGlobalFilter: false,
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Lease Remaining" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatLease(row.original.leaseRemainingSeconds)}</div>
    ),
  }),
]);

export const deviceColumnLabels: Record<string, string> = {
  ipAddress: 'IP Address',
  macAddress: 'MAC Address',
  interfaceName: 'Interface',
  leaseRemainingSeconds: 'Lease Remaining',
};
