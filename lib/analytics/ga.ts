/**
 * Thin GA4 client helper. Relies on `GoogleAnalytics` from `@next/third-parties`
 * (loads `gtag` when `NEXT_PUBLIC_GA_ID` is set).
 *
 * Never pass PII: no user_id, email, phone, NIN, passwords, tokens, or free-text
 * error messages. Prefer status + generic error_type + non-identifying context.
 */

export type GaEventStatus = "success" | "failure";

export type GaErrorType = "validation" | "network" | "api" | "unknown";

/** Allowed custom params only — keep this list tight for privacy. */
export type GaEventParams = {
  status?: GaEventStatus;
  error_type?: GaErrorType;
  method?: string;
  donation_type?: string;
  blood_type?: string;
  role?: "requester" | "donor" | string;
  score?: number;
  source?: string;
};

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetOrName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

const BLOCKED_KEYS = new Set([
  "user_id",
  "userId",
  "email",
  "phone",
  "phonenumber",
  "nin",
  "password",
  "token",
  "accessToken",
  "booking_id",
  "bookingId",
  "session_id",
  "sessionId",
  "donation_id",
  "donationId",
  "error_message",
  "message",
  "error",
]);

function sanitizeParams(
  params?: GaEventParams,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (BLOCKED_KEYS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number") {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function classifyAnalyticsError(error: unknown): GaErrorType {
  if (typeof error === "object" && error !== null) {
    const maybeAxios = error as {
      isAxiosError?: boolean;
      code?: string;
      response?: unknown;
      message?: string;
    };
    if (maybeAxios.isAxiosError || maybeAxios.response !== undefined) {
      if (
        maybeAxios.code === "ERR_NETWORK" ||
        maybeAxios.message === "Network Error"
      ) {
        return "network";
      }
      return "api";
    }
  }
  return "unknown";
}

/**
 * Fire a GA4 custom / recommended event. No-ops when gtag is unavailable
 * (e.g. GA id unset or script not yet loaded).
 */
export function trackEvent(name: string, params?: GaEventParams): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  if (typeof window.gtag !== "function") return;

  const safe = sanitizeParams(params);
  window.gtag("event", name, safe);
}

export function trackSuccess(
  name: string,
  params?: Omit<GaEventParams, "status" | "error_type">,
): void {
  trackEvent(name, { ...params, status: "success" });
}

export function trackFailure(
  name: string,
  errorType: GaErrorType = "unknown",
  params?: Omit<GaEventParams, "status" | "error_type">,
): void {
  trackEvent(name, { ...params, status: "failure", error_type: errorType });
}
