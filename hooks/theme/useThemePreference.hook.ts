"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "blivap-theme";

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

/** Cycles preference: Auto (system) → Dark → Light → Auto. */
export function nextThemePreference(
  preference: ThemePreference,
): ThemePreference {
  switch (preference) {
    case "system":
      return "dark";
    case "dark":
      return "light";
    case "light":
    default:
      return "system";
  }
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyDomTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useThemePreference() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemSchemeTick, setSystemSchemeTick] = useState(0);

  useLayoutEffect(() => {
    const p = getStoredPreference();
    /* One-time client hydration from localStorage — initial state must match SSR ("system"). */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync stored preference on mount only
    setPreferenceState(p);
  }, []);

  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemSchemeTick((t) => t + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const resolved = useMemo(() => {
    void systemSchemeTick;
    return resolveTheme(preference);
  }, [preference, systemSchemeTick]);

  useEffect(() => {
    applyDomTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { preference, resolved, setPreference };
}
