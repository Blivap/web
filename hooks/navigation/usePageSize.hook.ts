"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSetQueryParams } from "@/hooks/navigation/useQueryParamState.hook";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSizeOption = 10;

function isPageSizeOption(value: number): value is PageSizeOption {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}

/**
 * URL-backed items-per-page (`?limit=`). Changing size resets `page` to 1.
 */
export function usePageSize(
  defaultSize: PageSizeOption = DEFAULT_PAGE_SIZE,
): [PageSizeOption, (next: number) => void] {
  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();
  const raw = searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  const size = isPageSizeOption(parsed) ? parsed : defaultSize;

  const setSize = useCallback(
    (next: number) => {
      const safe = isPageSizeOption(next) ? next : defaultSize;
      setParams({
        limit: safe === defaultSize ? null : safe,
        page: null,
      });
    },
    [defaultSize, setParams],
  );

  return [size, setSize];
}
