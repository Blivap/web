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
  news: {
    url: string;
    apiKey: string;
  };
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
  const nodeEnv = (process.env.NODE_ENV ?? "development") as Env["env"];

  const siteUrl = resolveSiteUrl();

  const apiBaseUrl = requiredEnv(
    "API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL)",
    first(process.env.API_BASE_URL, process.env.NEXT_PUBLIC_API_BASE_URL),
  );

  const authTokenKey = requiredEnv(
    "AUTH_TOKEN_KEY (or NEXT_PUBLIC_AUTH_TOKEN_KEY)",
    first(process.env.AUTH_TOKEN_KEY, process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY),
  );

  const appName = requiredEnv(
    "APP_NAME (or NEXT_PUBLIC_APP_NAME)",
    first(process.env.APP_NAME, process.env.NEXT_PUBLIC_APP_NAME),
  );

  const enableFlag = first(
    process.env.ENABLE_NOTIFICATIONS,
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
  );

  const webPushVapidPublicKey = first(
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
  );

  const newsUrl = requiredEnv(
    "NEWS_URL (or NEXT_PUBLIC_NEWS_URL)",
    first(process.env.NEWS_URL, process.env.NEXT_PUBLIC_NEWS_URL),
  );

  const newsApiKey = requiredEnv(
    "NEWS_API_KEY (or NEXT_PUBLIC_NEWS_API_KEY)",
    first(process.env.NEWS_API_KEY, process.env.NEXT_PUBLIC_NEWS_API_KEY),
  );

  return {
    env: nodeEnv,
    url: siteUrl,
    apiUrl: apiBaseUrl,
    appName,
    enableNotifications: enableFlag === "true",
    webPushVapidPublicKey,
    authTokenKey,
    news: {
      url: newsUrl,
      apiKey: newsApiKey,
    },
  };
};

export const config = env();
