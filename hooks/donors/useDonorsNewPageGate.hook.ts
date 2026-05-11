"use client";

import Cookies from "js-cookie";
import { routes } from "@/config/routes";
import { useAppSelector } from "@/store/hooks";
import type { IUser } from "@/types";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function isElevatedStaff(user: IUser): boolean {
  const roles = user.roles;
  if (!roles?.length) return false;
  return roles.some((r) => {
    const x = String(r).toLowerCase();
    return x === "hospital" || x === "admin";
  });
}

/**
 * Mirrors verify-id session gating: wait for `/me`, then enforce identity
 * verification before donor onboarding (staff roles skip NIN redirect).
 */
export function useDonorsNewPageGate() {
  const [mounted, setMounted] = useState(false);
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const cookieToken =
    mounted && typeof window !== "undefined"
      ? Cookies.get("auth_token")
      : undefined;
  const hasSession = Boolean(token || cookieToken);

  const awaitingProfile = hasSession && user === null;

  const needsVerifyId = Boolean(
    user &&
      user.nationalIdentificationNumberVerified === false &&
      !isElevatedStaff(user),
  );

  useEffect(() => {
    if (!mounted || !user) return;
    if (
      user.nationalIdentificationNumberVerified === false &&
      !isElevatedStaff(user)
    ) {
      router.replace(routes.verifyId());
    }
  }, [mounted, user, router]);

  const showGateLoader = !mounted || awaitingProfile || needsVerifyId;

  return { showGateLoader };
}
