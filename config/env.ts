type Env = {
  env: "development" | "production" | "test";
  /** Public site URL (metadata, OG, structured data). */
  url: string;
  /** Backend API base URL (axios fetcher). */
  apiUrl: string;
  appName: string;
  enableNotifications: boolean;
  /**
   * VAPID public key (same as backend Web Push) for PushManager.subscribe.
   * Optional; web push registration is skipped when unset.
   */
  webPushVapidPublicKey: string | undefined;
  authTokenKey: string;
};

/** Prefer server env, then Next.js public env (matches typical `.env.local` layouts). */
const first = (...values: (string | undefined)[]): string | undefined =>
  values.find((v) => v !== undefined && v !== "");

const requiredEnv = (label: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${label}`);
  }
  return value;
};

function resolveAppEnv(): Env["env"] {
  const raw = (
    first(process.env.NEXT_PUBLIC_ENV, process.env.NODE_ENV) ?? "development"
  ).toLowerCase();

  if (raw === "production" || raw === "test" || raw === "development") {
    return raw;
  }
  return "development";
}

/** Canonical site origin; works when `.env` is missing in dev or on Vercel preview. */
function resolveSiteUrl(): string {
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;

  return (
    first(process.env.NEXT_PUBLIC_BASE_URL, process.env.SITE_URL, vercelUrl) ??
    "http://localhost:3000"
  );
}

const env = (): Env => {
  const siteUrl = resolveSiteUrl();

  const apiBaseUrl = requiredEnv(
    "NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_BASE / API_BASE_URL)",
    first(
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE,
      process.env.API_BASE_URL,
    ),
  );

  const authTokenKey = requiredEnv(
    "NEXT_PUBLIC_AUTH_TOKEN_KEY (or AUTH_TOKEN_KEY)",
    first(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY, process.env.AUTH_TOKEN_KEY),
  );

  const appName = requiredEnv(
    "NEXT_PUBLIC_APP_NAME (or APP_NAME)",
    first(process.env.NEXT_PUBLIC_APP_NAME, process.env.APP_NAME),
  );

  const enableFlag = first(
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
    process.env.ENABLE_NOTIFICATIONS,
  );

  const webPushVapidPublicKey = first(
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
  );

  return {
    env: resolveAppEnv(),
    url: siteUrl,
    apiUrl: apiBaseUrl,
    appName,
    enableNotifications: enableFlag === "true",
    webPushVapidPublicKey,
    authTokenKey,
  };
};

export const config = env();
