"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { initializeAuth } from "@/app/store/slices/authSlice";
import { useCheckUser } from "@/app/hooks/auth/useCheckUser.hook";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/researchers",
  "/healthcare&professionals",
  "/working_at",
  "/donors",
  "/about",
  "/about-blood",
  "/about-donating",
  "/about-sperm",
  "/contact",
  "/education",
  "/faq",
  "/giving-blood",
  "/healthcare",
  "/news",
  "/our-expertise",
  "/research",
  "/what-we-do",
  "/not_found",
  "/not-found",
];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Initialize auth from cookie on first mount
  useEffect(() => {
    dispatch(initializeAuth());
    setAuthInitialized(true);
  }, [dispatch]);

  // Check user details (calls /authentication/me) when authenticated
  const { isChecking } = useCheckUser();

  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.includes(pathname),
    [pathname],
  );

  useEffect(() => {
    const token = Cookies.get("auth_token");
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // If user is authenticated and trying to access home or auth routes, redirect to dashboard
    if (
      (pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register") &&
      (isAuthenticated || token)
    ) {
      router.push("/dashboard");
      return;
    }

    // If route is not public and user is not authenticated, redirect to home
    if (!isPublic && !isAuthenticated) {
      if (!token) {
        router.push("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  // For protected routes, wait for auth init + user check before rendering
  // Also wait if we have a token but no user (user is being fetched)
  const cookieToken = Cookies.get("auth_token");
  const hasToken = token || cookieToken;
  const waitingForUser = hasToken && !user && isChecking;
  
  if (!isPublicRoute && (!authInitialized || waitingForUser)) {
    return null;
  }

  // If user is authenticated and on home/auth routes, don't render (redirecting)
  if (
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register"
  ) {
    const token = Cookies.get("auth_token");
    if (isAuthenticated || token) {
      return null; // Will redirect in useEffect
    }
  }

  // Public routes always render
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes: if unauthenticated and no token, render nothing (redirect in effect)
  if (!isAuthenticated) {
    const token = Cookies.get("auth_token");
    if (!token) {
      return null;
    }
  }

  return <>{children}</>;
}
