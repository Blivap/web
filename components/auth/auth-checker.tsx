"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { initializeAuth } from "@/app/store/slices/authSlice";
import { useCheckUser } from "@/hooks/auth/useCheckUser.hook";
import { AuthLoader } from "./auth-loader.component";

const VERIFY_EMAIL_PATH = "/verify-email";

/**
 * Restores token from cookie into Redux, then runs token validation (GET /me).
 * User is only considered authenticated after we have a valid user from the API.
 * If the token is expired or invalid (401/403), logs out and redirects to /login.
 * Unverified users (emailVerified === false) are only allowed on /verify-email.
 * Shows a custom loader while auth status is being checked (token present, /me in flight).
 */
export function AuthChecker({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const { isChecking } = useCheckUser();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Unverified users may only access the verify-email page — redirect and block content.
  // If user has profileImage they've completed select_avatar, so send to dashboard not verify-email.
  useEffect(() => {
    if (
      user &&
      !user.emailVerified &&
      !user.profileImage &&
      pathname !== VERIFY_EMAIL_PATH
    ) {
      router.replace(VERIFY_EMAIL_PATH);
    }
    if (
      user &&
      !user.emailVerified &&
      user.profileImage &&
      pathname !== "/overview" &&
      !pathname.startsWith("/overview/")
    ) {
      router.replace("/overview");
    }
  }, [user, pathname, router]);

  // On verify-email page: if user is already verified, send to select avatar (next step after verification)
  useEffect(() => {
    if (user?.emailVerified && pathname === VERIFY_EMAIL_PATH) {
      router.replace("/select_avatar");
    }
  }, [user, pathname, router]);

  if (isChecking) {
    return <AuthLoader />;
  }

  // Do not render dashboard or other pages for unverified users without profileImage; show loader until redirect
  if (
    user &&
    !user.emailVerified &&
    !user.profileImage &&
    pathname !== VERIFY_EMAIL_PATH
  ) {
    return <AuthLoader />;
  }
  // Unverified but has profileImage (completed select_avatar): allow dashboard, block others until redirect
  if (
    user &&
    !user.emailVerified &&
    user.profileImage &&
    pathname !== "/overview" &&
    !pathname.startsWith("/overview/")
  ) {
    return <AuthLoader />;
  }

  // On verify-email page but already verified: show loader until redirect to select_avatar
  if (user?.emailVerified && pathname === VERIFY_EMAIL_PATH) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}
