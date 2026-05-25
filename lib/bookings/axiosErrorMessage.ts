import axios from "axios";

/** Best-effort `message` field from JSON API bodies (Nest-style). */
export function getApiMessageFromData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  if (Array.isArray(msg) && msg.length && typeof msg[0] === "string") {
    return msg[0].trim();
  }
  return null;
}

/** Best-effort message from Nest/axios error bodies. */
export function getAxiosErrorMessage(e: unknown, fallback: string): string {
  if (!axios.isAxiosError(e)) return fallback;
  return getApiMessageFromData(e.response?.data) ?? fallback;
}
