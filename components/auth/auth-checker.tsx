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
import { AuthLoader } from "./auth-loader.component";

const VERIFY_EMAIL_PATH = routes.verifyEmail;

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function isPublicAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return publicRoutes.includes(path);
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
 * Token is restored from the cookie in `StoreProvider`; session user is loaded via `useCheckUser` (GET /me).
 * User is only considered authenticated after we have a valid user from the API.
 * If the token is expired or invalid (401/403), logs out and redirects to /login.
 * Unverified users (emailVerified === false) are only allowed on /verify-email.
 * Verified users are redirected away from /verify-email and never see that page’s UI.
 * Shows a custom loader while auth status is being checked (token present, /me in flight).
 */
export function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { isChecking } = useCheckUser();
  useSessionExpiryWatcher();
  /** Avoid auth-gated UI until after hydrate (cookie/token only exist on the client). */
  const hasMounted = useHasMounted();

  // Clear one-shot redirect guard once we're on login
  useEffect(() => {
    if (pathname === routes.login) {
      try {
        sessionStorage.removeItem("blivap:auth:redirecting-login");
      } catch {
        /* ignore */
      }
    }
  }, [pathname]);

  // Protected route with no session after check finished → login (preserve return via dn)
  useEffect(() => {
    if (!hasMounted || isChecking) return;
    if (!pathname || !requiresAuth(pathname)) return;
    if (pathname === VERIFY_EMAIL_PATH) return;
    if (user) return;
    if (token) return; // /me still resolving or about to retry
    router.replace(loginWithReturn(pathname, currentSearch()));
  }, [hasMounted, isChecking, pathname, user, token, router]);

  // Unverified users may only access the verify-email page — redirect and block content.
  // Allow public marketing + not-found so 404 / legal pages still work.
  // If user has profileImage they've completed select_avatar, so send to dashboard not verify-email.
  useEffect(() => {
    if (
      user &&
      !user.emailVerified &&
      !user.profileImage &&
      pathname !== VERIFY_EMAIL_PATH &&
      pathname &&
      !isPublicAppPath(pathname) &&
      !isNotFoundPath(pathname)
    ) {
      const returnPath = sanitizeReturnPath(
        pathFromParts(pathname, currentSearch()),
      );
      router.replace(withDn(VERIFY_EMAIL_PATH, returnPath));
    }
    if (
      user &&
      !user.emailVerified &&
      user.profileImage &&
      pathname !== "/overview" &&
      !pathname.startsWith("/overview/") &&
      pathname &&
      !isPublicAppPath(pathname) &&
      !isNotFoundPath(pathname)
    ) {
      router.replace("/overview");
    }
  }, [user, pathname, router]);

  useEffect(() => {
    if (user?.emailVerified === true && pathname === VERIFY_EMAIL_PATH) {
      const params = new URLSearchParams(currentSearch());
      router.replace(getPostAuthRedirect(params));
    }
  }, [user, pathname, router]);

  /* `emailVerified === true`: never mount verify-email content (before global auth loading branch). */
  if (user?.emailVerified === true && pathname === VERIFY_EMAIL_PATH) {
    return <AuthLoader />;
  }

  if (isChecking) {
    return <AuthLoader />;
  }

  // Do not render dashboard or other pages for unverified users without profileImage; show loader until redirect
  if (
    user &&
    !user.emailVerified &&
    !user.profileImage &&
    pathname !== VERIFY_EMAIL_PATH &&
    pathname &&
    !isPublicAppPath(pathname) &&
    !isNotFoundPath(pathname)
  ) {
    return <AuthLoader />;
  }
  // Unverified but has profileImage (completed select_avatar): allow dashboard, block others until redirect
  if (
    user &&
    !user.emailVerified &&
    user.profileImage &&
    pathname !== "/overview" &&
    !pathname.startsWith("/overview/") &&
    pathname &&
    !isPublicAppPath(pathname) &&
    !isNotFoundPath(pathname)
  ) {
    return <AuthLoader />;
  }

  const isProtectedPath = Boolean(pathname) && requiresAuth(pathname);

  /*
   * Protected routes: same AuthLoader on server + first client paint (hasMounted=false),
   * then keep showing it until session is resolved. Avoids hydration mismatch from cookies.
   */
  if (isProtectedPath && (!hasMounted || (!user && !token))) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}
