"use client";

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "blivap-theme";
const SYSTEM_SCHEME_KEY = "blivap-theme-system-scheme";

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<
  ThemePreferenceContextValue | undefined
>(undefined);

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

function getSystemScheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function persistThemeState(
  preference: ThemePreference,
  systemScheme: ResolvedTheme,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, preference);
    localStorage.setItem(SYSTEM_SCHEME_KEY, systemScheme);
  } catch {
    /* ignore */
  }
}

function getReconciledThemeState(): {
  preference: ThemePreference;
  systemScheme: ResolvedTheme;
} {
  const systemScheme = getSystemScheme();
  if (typeof window === "undefined") {
    return { preference: "system", systemScheme };
  }

  const storedPreference = getStoredPreference();
  let storedSystemScheme: string | null = null;
  try {
    storedSystemScheme = localStorage.getItem(SYSTEM_SCHEME_KEY);
  } catch {
    /* ignore */
  }

  const systemChangedSinceLastVisit =
    (storedSystemScheme === "light" || storedSystemScheme === "dark") &&
    storedSystemScheme !== systemScheme;

  const preference =
    systemChangedSinceLastVisit && storedPreference !== "system"
      ? "system"
      : storedPreference;

  persistThemeState(preference, systemScheme);

  return { preference, systemScheme };
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

export function resolveTheme(
  preference: ThemePreference,
  systemScheme: ResolvedTheme = getSystemScheme(),
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemScheme;
}

function applyDomTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemScheme, setSystemScheme] = useState<ResolvedTheme>("light");
  /** Until true, resolve "system" as light so first client paint matches SSR (no `window` / matchMedia on server). */
  const [hasMounted, setHasMounted] = useState(false);
  const preferenceRef = useRef<ThemePreference>("system");

  useLayoutEffect(() => {
    const { preference: initialPreference, systemScheme: initialSystemScheme } =
      getReconciledThemeState();
    /* One-time client hydration from localStorage/system scheme. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync theme state once on mount
    setPreferenceState(initialPreference);
    setSystemScheme(initialSystemScheme);
    setHasMounted(true);
  }, []);

  useEffect(() => {
    preferenceRef.current = preference;
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const nextSystemScheme = event.matches ? "dark" : "light";
      setSystemScheme(nextSystemScheme);

      // Manual overrides are temporary: any OS theme change returns the app to system mode.
      if (preferenceRef.current !== "system") {
        setPreferenceState("system");
      }

      persistThemeState("system", nextSystemScheme);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = useMemo(() => {
    if (!hasMounted) {
      if (preference === "light") return "light";
      if (preference === "dark") return "dark";
      return "light";
    }
    return resolveTheme(preference, systemScheme);
  }, [preference, systemScheme, hasMounted]);

  useEffect(() => {
    applyDomTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    const nextSystemScheme = getSystemScheme();
    setSystemScheme(nextSystemScheme);
    setPreferenceState(next);
    persistThemeState(next, nextSystemScheme);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return createElement(ThemePreferenceContext.Provider, { value }, children);
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error(
      "useThemePreference must be used within a ThemePreferenceProvider",
    );
  }
  return context;
}
