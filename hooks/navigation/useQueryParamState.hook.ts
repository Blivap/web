"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type QueryParamUpdates = Record<
  string,
  string | number | boolean | null | undefined
>;

function currentSearchString(searchParams: URLSearchParams): string {
  if (typeof window !== "undefined") {
    const q = window.location.search;
    return q.startsWith("?") ? q.slice(1) : q;
  }
  return searchParams.toString();
}

/**
 * Batch-update URL search params without scrolling.
 * Pass `null` / `undefined` / `""` to remove a key. Booleans use `"1"` when true.
 */
export function useSetQueryParams() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (
      updates: QueryParamUpdates,
      options?: { history?: "replace" | "push" },
    ) => {
      // Prefer the live URL so this callback can stay stable across param changes
      // (avoids debounce/effects re-firing and wiping pagination).
      const params = new URLSearchParams(currentSearchString(searchParams));
      for (const [key, value] of Object.entries(updates)) {
        // `undefined` = leave untouched; `null` / `""` = remove.
        if (value === undefined) continue;
        if (value === null || value === "") {
          params.delete(key);
        } else if (typeof value === "boolean") {
          if (value) params.set(key, "1");
          else params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      const navigate =
        options?.history === "push" ? router.push : router.replace;
      void navigate(url, { scroll: false });
    },
    // `searchParams` intentionally omitted — `currentSearchString` reads
    // `window.location` on the client, so a stable setter is safe and correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
    [pathname, router],
  );
}

/**
 * String query param mirrored to the URL (for filters, tabs, modal names, etc.).
 */
export function useQueryParam(
  key: string,
  defaultValue = "",
  options?: {
    /** Remove the param from the URL when value equals this. */
    omitWhen?: string;
    allowed?: readonly string[];
  },
): [string, (next: string) => void] {
  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();

  const omitWhen = options?.omitWhen;
  const allowed = options?.allowed;
  const raw = searchParams.get(key);
  let value = defaultValue;
  if (raw != null && raw !== "") {
    if (!allowed || allowed.includes(raw)) {
      value = raw;
    }
  }

  const setValue = useCallback(
    (next: string) => {
      const omit =
        omitWhen !== undefined
          ? next === omitWhen
          : next === "" || next === defaultValue;
      setParams({ [key]: omit ? null : next });
    },
    [defaultValue, key, omitWhen, setParams],
  );

  return [value, setValue];
}

/** Positive integer query param (pagination). Defaults to omitting `1`. */
export function useQueryParamNumber(
  key: string,
  defaultValue = 1,
  options?: { min?: number; omitWhen?: number },
): [number, (next: number) => void] {
  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();
  const min = options?.min ?? 1;
  const raw = searchParams.get(key);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  const value =
    Number.isFinite(parsed) && parsed >= min ? parsed : defaultValue;

  const setValue = useCallback(
    (next: number) => {
      const safe = Math.max(min, Math.floor(next));
      const omitWhen = options?.omitWhen ?? defaultValue;
      setParams({ [key]: safe === omitWhen ? null : safe });
    },
    [defaultValue, key, min, options?.omitWhen, setParams],
  );

  return [value, setValue];
}

/**
 * Named modal open state via `?modal=<name>`.
 * Closing clears `modal` only when it currently matches `name`.
 */
export function useQueryModal(
  name: string,
): [boolean, (open: boolean) => void] {
  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();
  const open = searchParams.get("modal") === name;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setParams({ modal: name });
        return;
      }
      if (searchParams.get("modal") === name) {
        setParams({ modal: null });
      }
    },
    [name, searchParams, setParams],
  );

  return [open, setOpen];
}
