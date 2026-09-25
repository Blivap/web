"use client";

import Cookies from "js-cookie";
import { $api } from "@/app/api";
import { routes } from "@/config/routes";
import { isExistingRegisteredDonor } from "@/lib/donors/donorProfileGuards";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
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
 * Also blocks users who already completed donor registration.
 */
export function useDonorsNewPageGate() {
  const [mounted, setMounted] = useState(false);
  const [donorCheckState, setDonorCheckState] = useState<
    "idle" | "loading" | "ready"
  >("idle");
  const [alreadyDonor, setAlreadyDonor] = useState(false);
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

  useEffect(() => {
    if (!mounted || !user || needsVerifyId) return;

    let cancelled = false;
    setDonorCheckState("loading");

    void (async () => {
      try {
        const { data, status } = await $api.donors.me();
        if (cancelled) return;
        if (status >= 200 && status < 300 && data) {
          const raw = unwrapApiRecord(data);
          if (raw && isExistingRegisteredDonor(raw)) {
            setAlreadyDonor(true);
          }
        }
      } catch {
        // No donor profile — allow registration.
      } finally {
        if (!cancelled) setDonorCheckState("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, user, needsVerifyId]);

  const showGateLoader =
    !mounted ||
    awaitingProfile ||
    needsVerifyId ||
    (Boolean(user) && !needsVerifyId && donorCheckState !== "ready");

  return { showGateLoader, alreadyDonor };
}
