"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * DataTable — DESIGN_SYSTEM.md §8, composed on the Table primitives.
 * Presentational only: sorting/filtering/pagination state is owned by the
 * caller and passed in via props/callbacks, so wiring it into an existing
 * page never requires moving business logic into this component.
 */
export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  numeric?: boolean;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  skeletonRows?: number;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  selectedIds?: Set<string | number>;
  /** Pagination or summary row rendered below the table, outside the scroll area. */
  footer?: React.ReactNode;
  className?: string;
}

function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
  sortKey,
  sortDir,
  onSortChange,
  selectedIds,
  footer,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-ds-lg border border-ink-200 bg-white", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <TableHead
                  key={col.key}
                  align={col.align ?? (col.numeric ? "right" : "left")}
                  className={cn(col.sortable && "cursor-pointer select-none", col.className)}
                  onClick={col.sortable ? () => onSortChange?.(col.key) : undefined}
                >
                  <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                    {col.header}
                    {col.sortable &&
                      (isSorted ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 text-ink-400" />
                      ))}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, r) => (
              <TableRow key={r} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align ?? (col.numeric ? "right" : "left")}>
                    <Skeleton className="h-3.5 w-full max-w-[8rem]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-auto p-0">
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const id = getRowId(row);
              return (
                <TableRow
                  key={id}
                  selected={selectedIds?.has(id)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align ?? (col.numeric ? "right" : "left")}
                      numeric={col.numeric}
                      className={col.className}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {footer && <div className="border-t border-ink-200 px-4 py-3">{footer}</div>}
    </div>
  );
}

export { DataTable };
