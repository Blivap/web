import axios from "axios";

/** Best-effort message from Nest/axios error bodies. */
export function getAxiosErrorMessage(
  e: unknown,
  fallback: string,
): string {
  if (!axios.isAxiosError(e)) return fallback;
  const data = e.response?.data;
  if (data && typeof data === "object") {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
    if (Array.isArray(msg) && msg.length && typeof msg[0] === "string") {
      return msg[0];
    }
  }
  return fallback;
}
