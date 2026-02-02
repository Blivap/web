"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { initializeAuth } from "@/app/store/slices/authSlice";
import { useCheckUser } from "@/app/hooks/auth/useCheckUser.hook";
import { isEmailUnverified } from "@/app/utils/user";
import Cookies from "js-cookie";

function AuthLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F8F8]">
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute size-24 rounded-full animate-spin duration-1000 ease-in-out border-2 border-primary/20 border-t-primary"
            aria-hidden
          />
    
         <span
  className="text-6xl font-black text-transparent
         [-webkit-text-stroke:2.5px_#960018]
">
  B
</span>

        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-[#49475A] sm:text-base">
         Blivap
          </p>
          <div className="flex gap-1.5">
            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:500ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// /verify-email is intentionally NOT public: user must be logged in so we can check emailVerified
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
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
  const { isAuthenticated, token, user } = useAppSelector(
    (state) => state.auth,
  );
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
    const cookieToken = Cookies.get("auth_token");
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const hasToken = isAuthenticated || cookieToken;

    // If user is authenticated and trying to access login/register, redirect (do not redirect from "/")
    if ((pathname === "/login" || pathname === "/register") && hasToken) {
      if (user && isEmailUnverified(user)) {
        router.push("/verify-email");
        return;
      }
      router.push("/dashboard");
      return;
    }

    // If on a protected route (other than verify-email) and user is unverified, redirect to verify-email
    if (
      !isPublic &&
      pathname !== "/verify-email" &&
      user &&
      isEmailUnverified(user)
    ) {
      router.push("/verify-email");
      return;
    }

    // If route is not public and user is not authenticated, redirect to home
    if (!isPublic && !isAuthenticated) {
      if (!cookieToken) {
        router.push("/");
      }
    }
  }, [isAuthenticated, pathname, user, router]);

  // For protected routes, wait for auth init + user check before rendering
  // Also wait if we have a token but no user (user is being fetched)
  const cookieToken = Cookies.get("auth_token");
  const hasToken = token || cookieToken;
  const waitingForUser = hasToken && !user && isChecking;

  if (!isPublicRoute && (!authInitialized || waitingForUser)) {
    return <AuthLoader />;
  }

  // If user is authenticated and on login/register, don't render (redirecting)
  if (pathname === "/login" || pathname === "/register") {
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

  // Protected routes: if user is unverified, block except on /verify-email (where they must complete verification)
  if (
    !isPublicRoute &&
    pathname !== "/verify-email" &&
    user &&
    isEmailUnverified(user)
  ) {
    return null;
  }

  return <>{children}</>;
}
