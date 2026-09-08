import { logout } from "@/store/slices/authSlice";
import { getClientStore } from "@/store/store";
import { routes } from "@/config/routes";

const REDIRECTING_KEY = "blivap:auth:redirecting-login";

function isAlreadyOnLogin(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === routes.login || path.startsWith(`${routes.login}/`);
}

/**
 * Clears local auth state and navigates to /login once.
 * Safe to call from axios interceptors (no React hooks).
 */
export function forceSessionEnd(options?: {
  /** Soft SPA navigation via callback when available */
  replace?: (path: string) => void;
  /** Avoid hard navigation (e.g. when caller already redirects) */
  redirect?: boolean;
}): void {
  if (typeof window === "undefined") return;

  const store = getClientStore();
  if (store) {
    store.dispatch(logout());
  }

  const shouldRedirect = options?.redirect !== false;
  if (!shouldRedirect || isAlreadyOnLogin()) return;

  // Prevent stacked 401s from queuing multiple navigations
  try {
    if (sessionStorage.getItem(REDIRECTING_KEY) === "1") return;
    sessionStorage.setItem(REDIRECTING_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }

  const loginPath = routes.login;

  if (options?.replace) {
    options.replace(loginPath);
    queueMicrotask(() => {
      try {
        sessionStorage.removeItem(REDIRECTING_KEY);
      } catch {
        /* ignore */
      }
    });
    return;
  }

  // Hard navigation so protected UI cannot keep mounting with a dead session
  window.location.replace(loginPath);
}
