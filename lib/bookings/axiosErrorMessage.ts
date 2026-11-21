import axios from "axios";
import { looksLikeHtmlDocument } from "@/lib/api/htmlErrorBody";
import {
  API_UNREACHABLE_MESSAGE,
  isNetworkFailure,
} from "@/lib/api/networkFailure";

/** Best-effort `message` field from JSON API bodies (Nest-style). */
export function getApiMessageFromData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string" && msg.trim()) {
    const trimmed = msg.trim();
    // Gateway HTML pages are not useful as toast/inline copy.
    if (looksLikeHtmlDocument(trimmed)) return null;
    return trimmed;
  }
  if (Array.isArray(msg) && msg.length && typeof msg[0] === "string") {
    return msg[0].trim();
  }
  return null;
}

/** Best-effort message from Nest/axios error bodies. */
export function getAxiosErrorMessage(e: unknown, fallback: string): string {
  if (isNetworkFailure(e)) return API_UNREACHABLE_MESSAGE;
  if (!axios.isAxiosError(e)) return fallback;
  const data = e.response?.data;
  if (typeof data === "string" && looksLikeHtmlDocument(data)) return fallback;
  return getApiMessageFromData(data) ?? fallback;
}
