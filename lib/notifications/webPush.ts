import { $api } from "@/app/api";
import { config } from "@/config/env";
import {
  getWebFcmToken,
  listenForForegroundPush,
} from "@/lib/firebase/messaging";

/**
 * Registers an FCM web token with the API (same endpoint as mobile).
 * Uses NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY as the Firebase Web Push cert key.
 */
export async function registerWebPushSubscription(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!config.enableNotifications || !config.webPushVapidPublicKey) return;

  try {
    const fcmToken = await getWebFcmToken();
    if (!fcmToken) return;

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : undefined;

    await $api.notifications.registerFcmPush({
      fcmToken,
      userAgent,
    });
  } catch {
    // Permission or network errors; inbox still works via GET /notifications.
  }
}

/** Show a system notification while the app tab is focused. */
export function attachForegroundPushHandler(): (() => void) | null {
  if (typeof window === "undefined") return null;
  if (!config.enableNotifications || !config.webPushVapidPublicKey) return null;

  return listenForForegroundPush(({ title, body, data }) => {
    if (Notification.permission !== "granted") return;
    const notification = new Notification(title, {
      body,
      data,
      icon: "/icon1.png",
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  });
}
