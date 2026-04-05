import { $api } from "@/api";
import { config } from "@/config/env";

const SW_PATH = "/push-sw.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function subscriptionKeysToBase64(subscription: PushSubscription): {
  endpoint: string;
  p256dh: string;
  auth: string;
} {
  const key256 = subscription.getKey("p256dh");
  const keyAuth = subscription.getKey("auth");
  if (!key256 || !keyAuth) {
    throw new Error("Push subscription keys missing");
  }
  const toB64 = (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)));
  return {
    endpoint: subscription.endpoint,
    p256dh: toB64(key256),
    auth: toB64(keyAuth),
  };
}

/**
 * Registers the push service worker, subscribes with VAPID, and POSTs to the API.
 * Safe to call multiple times; browser may return an existing subscription.
 */
export async function registerWebPushSubscription(): Promise<void> {
  if (typeof window === "undefined") return;
  const vapid = config.webPushVapidPublicKey;
  if (!vapid || !config.enableNotifications) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const reg = await navigator.serviceWorker.register(SW_PATH, {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
    }));

  const { endpoint, p256dh, auth } = subscriptionKeysToBase64(sub);
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : undefined;

  try {
    await $api.notifications.registerWebPush({
      endpoint,
      p256dh,
      auth,
      userAgent,
    });
  } catch {
    // Permission or network errors; inbox still works via GET /notifications.
  }
}
