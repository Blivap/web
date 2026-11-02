"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { config } from "@/config/env";
import {
  attachForegroundPushHandler,
  registerWebPushSubscription,
} from "@/lib/notifications/webPush";

/**
 * After login, registers Firebase web FCM when notifications + VAPID key are set.
 */
export function PushNotificationRegistrar() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!config.enableNotifications || !config.webPushVapidPublicKey) return;

    void registerWebPushSubscription();
    const stop = attachForegroundPushHandler();
    return () => {
      stop?.();
    };
  }, [isAuthenticated]);

  return null;
}
