"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { config } from "@/config/env";
import { registerWebPushSubscription } from "@/lib/notifications/webPush";

/**
 * After login, registers Web Push (VAPID) when enabled in env and key is set.
 */
export function PushNotificationRegistrar() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!config.enableNotifications || !config.webPushVapidPublicKey) return;

    void registerWebPushSubscription();
  }, [isAuthenticated]);

  return null;
}
