"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useCheckUser } from "@/hooks/auth/useCheckUser.hook";
import { useSessionExpiryWatcher } from "@/hooks/auth/useSessionExpiryWatcher.hook";
import {
  isNotFoundPath,
  publicRoutes,
  requiresAuth,
  routes,
} from "@/config/routes";
import {
  getPostAuthRedirect,
  loginWithReturn,
  pathFromParts,
  sanitizeReturnPath,
  withDn,
} from "@/lib/navigation/authRedirect";
import type { IUser } from "@/types";
import { AuthLoader } from "./auth-loader.component";

const LOGIN_REDIRECT_GUARD_KEY = "blivap:auth:redirecting-login";

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function isPublicAppPath(pathname: string): boolean {
  return publicRoutes.includes(normalizePath(pathname));
}

/** Marketing, legal, and 404 — reachable regardless of verification state. */
function isOpenPath(pathname: string): boolean {
  return isPublicAppPath(pathname) || isNotFoundPath(pathname);
}

function isOverviewPath(pathname: string): boolean {
  return (
    pathname === routes.overview || pathname.startsWith(`${routes.overview}/`)
  );
}

/** Protected app shell (not verify-email / email-link landing). */
function isAppShellPath(pathname: string): boolean {
  return requiresAuth(pathname) && pathname !== routes.verifyEmail;
}

function currentSearch(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

/** Client snapshot is true; server snapshot is false — no useEffect setState. */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Single source of truth for client-side auth navigation.
 *
 * Rules:
 * - Guests cannot open the app shell → `/login` (with return `dn`).
 * - Verified users leave `/verify-email` → post-auth destination.
 * - Unverified without avatar → `/verify-email` only (plus open paths).
 * - Unverified with avatar → `/overview` only (plus open paths).
 *   Always `/overview` here — never honor `dn` (would fight the overview-only gate).
 */
function resolveAuthRedirect(args: {
  pathname: string | null;
  user: IUser | null;
  token: string | null;
  ready: boolean;
}): string | null {
  const { pathname, user, token, ready } = args;
  if (!ready || !pathname) return null;

  if (!user) {
    // Token present → `/me` still resolving; do not bounce yet.
    if (token) return null;
    if (!isAppShellPath(pathname)) return null;
    return loginWithReturn(pathname, currentSearch());
  }

  if (user.emailVerified) {
    if (pathname !== routes.verifyEmail) return null;
    return getPostAuthRedirect(new URLSearchParams(currentSearch()));
  }

  // Unverified: open paths stay reachable.
  if (isOpenPath(pathname)) return null;

  if (user.profileImage) {
    return isOverviewPath(pathname) ? null : routes.overview;
  }

  if (pathname === routes.verifyEmail) return null;
  const returnPath = sanitizeReturnPath(
    pathFromParts(pathname, currentSearch()),
  );
  return withDn(routes.verifyEmail, returnPath);
}

/**
 * Token is restored from the cookie in `StoreProvider`; session user is loaded via `useCheckUser` (GET /me).
 * User is only considered authenticated after we have a valid user from the API.
 * If the token is expired or invalid (401/403), logs out and redirects to /login.
 */
export function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { isChecking } = useCheckUser();
  useSessionExpiryWatcher();
  const hasMounted = useHasMounted();

  const ready = hasMounted && !isChecking;
  const redirectTo = resolveAuthRedirect({
    pathname,
    user,
    token,
    ready,
  });

  // Clear one-shot redirect guard once we're on login
  useEffect(() => {
    if (pathname !== routes.login) return;
    try {
      sessionStorage.removeItem(LOGIN_REDIRECT_GUARD_KEY);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  const awaitingSession =
    Boolean(pathname) && isAppShellPath(pathname) && (!hasMounted || !user);

  // AuthLoader is fixed inset-0 — keep the page under it so the check feels like an overlay.
  if (redirectTo || awaitingSession || isChecking) {
    return (
      <>
        {children}
        <AuthLoader />
      </>
    );
  }

  return <>{children}</>;
}
