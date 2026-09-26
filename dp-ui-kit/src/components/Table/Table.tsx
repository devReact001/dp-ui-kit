import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner/Spinner';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  caption?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

function TableInner<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  striped = false,
  hoverable = true,
  stickyHeader = false,
  caption,
  onRowClick,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-gray-200', className)}>
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead className={cn('bg-gray-50', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                style={{ width: col.width }}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                className={cn(
                  'border-b border-gray-200 px-4 py-3 font-semibold text-gray-600',
                  alignClass[col.align ?? 'left'],
                  col.sortable && 'cursor-pointer select-none hover:bg-gray-100'
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span aria-hidden="true" className="text-gray-400">
                      {sortKey === col.key
                        ? sortDir === 'asc' ? '↑' : '↓'
                        : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Spinner size="lg" />
              </td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-gray-100 last:border-0',
                  striped && i % 2 === 1 && 'bg-gray-50',
                  hoverable && 'hover:bg-blue-50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('px-4 py-3 text-gray-800', alignClass[col.align ?? 'left'])}
                  >
                    {col.render
                      ? col.render(row, i)
                      : String(row[col.key as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Memoized so a Table only re-renders when its columns/data/props
 * actually change by reference — important because Table sits inside
 * pages that re-render on unrelated state changes (toasts, modals,
 * search input) and rendering a large table on every keystroke is
 * exactly the kind of unnecessary re-render this is meant to prevent.
 * Callers should memoize `columns` (useMemo) and any handlers passed
 * into it (useCallback) so this memoization is actually effective —
 * see UserManagementPage for an example.
 */
export const Table = React.memo(TableInner) as typeof TableInner;
