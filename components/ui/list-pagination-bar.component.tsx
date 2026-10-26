"use client";

import { PageSizeSelect } from "@/components/ui/page-size-select.component";
import {
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls.component";
import { cn } from "@/lib/utils";

type ListPaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (next: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  disabled?: boolean;
  className?: string;
};

export function ListPaginationBar({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage,
  disabled = false,
  className,
}: ListPaginationBarProps) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);
  const canGoPrevious = hasPreviousPage ?? safePage > 1;
  const canGoNext = hasNextPage ?? safePage < safeTotal;

  return (
    <div className={cn("@container min-w-0", className)}>
      <div className="flex flex-col rounded-lg border border-border bg-[#F9FAFB] px-2.5 py-2 dark:border-white/10 dark:bg-white/6 @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between @min-[40rem]:gap-4 @min-[40rem]:px-4 @min-[40rem]:py-2.5">
        <div className="flex items-center justify-between gap-2 @min-[40rem]:contents">
          <PaginationPrevious
            aria-label="Previous page"
            className="size-8 p-0 @min-[40rem]:hidden"
            disabled={!canGoPrevious || disabled}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
          />
          <p className="min-w-0 flex-1 text-center text-xs whitespace-nowrap text-text-secondary @min-[40rem]:flex-none @min-[40rem]:text-left">
            Page{" "}
            <span className="font-semibold text-text-primary">{safePage}</span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {safeTotal}
            </span>
          </p>
          <PaginationNext
            aria-label="Next page"
            className="size-8 p-0 @min-[40rem]:hidden"
            disabled={!canGoNext || disabled}
            onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
          />
        </div>
        <div
          aria-hidden
          className="-mx-2.5 my-2 border-t border-border dark:border-white/10 @min-[40rem]:hidden"
        />
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 @min-[40rem]:ms-auto @min-[40rem]:gap-3">
          <PageSizeSelect
            value={pageSize}
            onChange={onPageSizeChange}
            disabled={disabled}
            triggerClassName="w-14 border-transparent bg-transparent px-1.5 shadow-none @min-[40rem]:w-[4.75rem] @min-[40rem]:border-border @min-[40rem]:bg-white @min-[40rem]:px-3 @min-[40rem]:dark:border-white/10 @min-[40rem]:dark:bg-[#1a1a22]"
          />
          <div className="hidden min-w-0 @min-[40rem]:block">
            <PaginationControls
              className="max-w-full"
              page={safePage}
              totalPages={safeTotal}
              onPageChange={onPageChange}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
