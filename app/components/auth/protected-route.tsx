"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { initializeAuth } from "@/app/store/slices/authSlice";
import { useCheckUser } from "@/app/hooks/auth/useCheckUser.hook";
import Cookies from "js-cookie";
import { Splash } from "@/app/components/splash/splash.component";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
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
];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Initialize auth from cookie on first mount
  useEffect(() => {
    dispatch(initializeAuth());
    setAuthInitialized(true);
  }, [dispatch]);

  // Check user details (calls /authentication/me) when authenticated
  const { isChecking } = useCheckUser();

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const token = Cookies.get("auth_token");

    // If user is authenticated and trying to access home or auth routes, redirect to dashboard
    if (
      (pathname === "/auth/login" || pathname === "/auth/register") &&
      (isAuthenticated || token)
    ) {
      router.push("/");
      return;
    }

    // If route is not public and user is not authenticated, redirect to home
    if (!isPublicRoute && !isAuthenticated) {
      if (!token) {
        router.push("/");
      }
    }
  }, [isAuthenticated, pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // For protected routes, wait for auth init + user check before rendering
  if (!isPublicRoute && (!authInitialized || isChecking)) {
    return null;
  }

  if (pathname === "/auth/login" || pathname === "/auth/register") {
    const token = Cookies.get("auth_token");
    if (isAuthenticated || token) {
      return null;
    }
  }

  // Public routes always render (after initial auth init, which is cheap)

  // Protected routes: if unauthenticated and no token, render nothing (redirect in effect)
  if (!isAuthenticated) {
    const token = Cookies.get("auth_token");
    if (!token) {
      return null;
    }
  }
  if (isPublicRoute) {
    return <>{children}</>;
  }
  return <>{children}</>;
}
