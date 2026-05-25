/** Query param on `/bookings/meetup` — peer's six-digit code after they scan your QR. */
export const MEETUP_VERIFY_MEETING_CODE_PARAM = "verifyMeetupCode";

export function meetupPendingVerifyCodeStorageKey(sessionId: string): string {
  return `meetup_pending_verify_code_${encodeURIComponent(sessionId)}`;
}

/** Extract a six-digit meetup code from a scanned QR (URL or raw digits). */
export function parseCodeFromScannedMeetupPayload(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(
      trimmed,
      typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost",
    );
    const fromParam = url.searchParams.get(MEETUP_VERIFY_MEETING_CODE_PARAM);
    const digits = fromParam?.replace(/\D/g, "").slice(0, 6);
    if (digits?.length === 6) return digits;
  } catch {
    /* not a URL */
  }

  const digits = trimmed.replace(/\D/g, "").slice(0, 6);
  return digits.length === 6 ? digits : null;
}

/** QR payload: opens the scanner's meetup and submits your six-digit code. */
export function buildMeetupSwapCodeQrUrl(
  origin: string,
  bookingId: string,
  mySixDigitCode: string,
): string {
  const base = origin.replace(/\/$/, "");
  const params = new URLSearchParams({
    bookingId,
    [MEETUP_VERIFY_MEETING_CODE_PARAM]: mySixDigitCode,
  });
  return `${base}/bookings/meetup?${params.toString()}`;
}
