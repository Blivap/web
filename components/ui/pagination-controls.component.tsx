"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function buildPaginationPageItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}

export type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  disabled?: boolean;
  className?: string;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  disabled = false,
  className,
}: PaginationControlsProps) {
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const canGoPrevious = hasPreviousPage ?? safePage > 1;
  const canGoNext = hasNextPage ?? safePage < totalPages;

  const pageItems = useMemo(
    () => buildPaginationPageItems(safePage, totalPages),
    [safePage, totalPages],
  );

  return (
    <Pagination
      className={cn(
        "mx-0 w-full min-w-0 shrink-0 sm:ms-auto sm:w-auto sm:justify-end",
        className,
      )}
    >
      <PaginationContent className="flex-wrap justify-center gap-1.5 sm:justify-end">
        <PaginationItem>
          <PaginationPrevious
            aria-label="Previous page"
            disabled={!canGoPrevious || disabled}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
          />
        </PaginationItem>
        {totalPages > 1
          ? pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${item}`}>
                  <PaginationLink
                    aria-label={`Page ${item}`}
                    isActive={item === safePage}
                    disabled={disabled}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )
          : null}
        <PaginationItem>
          <PaginationNext
            aria-label="Next page"
            disabled={!canGoNext || disabled}
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
