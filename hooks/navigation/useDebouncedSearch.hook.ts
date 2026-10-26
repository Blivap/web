"use client";

import { useEffect, useRef, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 400;

/**
 * Debounced mirror of a rapidly changing value (local filter queries).
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Local search input with a debounced commit (URL params, API refetch, etc.).
 * Skips commit when the trimmed input already matches `committedValue`.
 */
export function useDebouncedSearch(
  committedValue: string,
  onCommit: (trimmed: string) => void,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): [string, (next: string) => void] {
  const [input, setInput] = useState(committedValue);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    setInput(committedValue);
  }, [committedValue]);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === committedValue.trim()) return;
    const timeout = window.setTimeout(() => {
      onCommitRef.current(trimmed);
    }, delayMs);
    return () => window.clearTimeout(timeout);
  }, [input, committedValue, delayMs]);

  return [input, setInput];
}
