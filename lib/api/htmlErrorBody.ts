/** Detect gateway / proxy HTML documents stuffed into API error payloads. */
export function looksLikeHtmlDocument(value: string): boolean {
  const head = value.trimStart().slice(0, 240).toLowerCase();
  return (
    head.startsWith("<!doctype html") ||
    head.startsWith("<html") ||
    (head.includes("<html") && head.includes("<body"))
  );
}

export function friendlyHttpErrorMessage(
  status: number,
  fallback: string,
): string {
  if (status === 502 || status === 503 || status === 504) {
    return "Support is temporarily unavailable. Please try again in a moment.";
  }
  if (status >= 500) {
    return "Something went wrong on the server. Please try again shortly.";
  }
  return fallback;
}

/** Pull an HTML document from Nest/axios error bodies when present. */
export function extractHtmlErrorBody(data: unknown): string | null {
  if (typeof data === "string" && looksLikeHtmlDocument(data)) return data;
  if (!data || typeof data !== "object") return null;
  const message = (data as { message?: unknown }).message;
  if (typeof message === "string" && looksLikeHtmlDocument(message)) {
    return message;
  }
  return null;
}
