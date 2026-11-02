import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

import { config } from "@/config/env";

const SW_PATH = "/firebase-messaging-sw.js";

function firebaseWebConfig() {
  const { apiKey, authDomain, projectId, appId, messagingSenderId } =
    config.firebase;
  if (!apiKey || !authDomain || !projectId || !appId || !messagingSenderId) {
    return null;
  }
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId,
  };
}

function firebaseApp(): FirebaseApp | null {
  const cfg = firebaseWebConfig();
  if (!cfg) return null;
  return getApps().length ? getApp() : initializeApp(cfg);
}

function messagingOrNull(): Messaging | null {
  const app = firebaseApp();
  if (!app || typeof window === "undefined") return null;
  return getMessaging(app);
}

/**
 * Registers the Firebase messaging SW and returns an FCM token for
 * POST /notifications/push-subscriptions/fcm.
 */
export async function getWebFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;

  const vapidKey = config.webPushVapidPublicKey;
  if (!vapidKey || !config.enableNotifications) return null;

  const messaging = messagingOrNull();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register(SW_PATH, {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
}

/** Foreground FCM messages (tab focused) — SW does not show these. */
export function listenForForegroundPush(
  onPayload: (payload: {
    title: string;
    body: string;
    data: Record<string, string>;
  }) => void,
): (() => void) | null {
  const messaging = messagingOrNull();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    const data = (payload.data ?? {}) as Record<string, string>;
    const title =
      payload.notification?.title || data.title || config.appName || "Blivap";
    const body = payload.notification?.body || data.body || "";
    onPayload({ title, body, data });
  });
}
