const ALLOWED_TAG = /^(?:br|strong|em|b|i|p|ul|ol|li|span|div|a)$/i;

/** True when the body looks like HTML rather than plain text. */
export function notificationBodyLooksLikeHtml(raw: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(raw);
}

/**
 * Plain-text preview for compact UIs (popover line-clamp).
 * Turns `<br>` into spaces and strips other tags.
 */
export function notificationBodyToPlainText(raw: string): string {
  if (!raw) return "";
  if (!notificationBodyLooksLikeHtml(raw)) {
    return raw.replace(/\s+/g, " ").trim();
  }

  return raw
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\/\s*p\s*>/gi, " ")
    .replace(/<\s*p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Allow only a small set of formatting tags used in Blivap notification emails.
 * Strips scripts, event handlers, and unknown markup.
 */
export function sanitizeNotificationHtml(raw: string): string {
  if (!raw) return "";
  if (!notificationBodyLooksLikeHtml(raw)) {
    return escapeHtml(raw).replace(/\n/g, "<br />");
  }

  // Drop dangerous blocks outright.
  let html = raw
    .replace(
      /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi,
      "",
    );

  // Remove event handlers / javascript: URLs.
  html = html
    .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');

  // Keep only allowed tags; strip attributes except safe href on anchors.
  html = html.replace(
    /<\/?([a-z0-9]+)(\s[^>]*)?>/gi,
    (match, tag: string, attrs = "") => {
      if (!ALLOWED_TAG.test(tag)) return "";
      const closing = match.startsWith("</");
      if (closing) return `</${tag.toLowerCase()}>`;
      if (/^br$/i.test(tag)) return "<br />";
      if (/^a$/i.test(tag)) {
        const href = extractSafeHref(attrs);
        return href
          ? `<a href="${href}" rel="noopener noreferrer" target="_blank">`
          : "<a>";
      }
      return `<${tag.toLowerCase()}>`;
    },
  );

  // Normalize excessive breaks from email templates.
  html = html.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br /><br />").trim();

  return html;
}

function extractSafeHref(attrs: string): string | null {
  const match = attrs.match(/\bhref\s*=\s*(['"])(.*?)\1/i);
  if (!match?.[2]) return null;
  const href = match[2].trim();
  if (!/^(https?:|mailto:|\/)/i.test(href)) return null;
  return escapeHtml(href);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
