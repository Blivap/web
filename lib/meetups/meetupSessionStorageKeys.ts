/** Session-only keys for one-time meetup material (never log values). */
export function meetupOtqrStorageKey(sessionId: string): string {
  return `meetup_otqr_${sessionId}`;
}

export function meetupCodeHintStorageKey(sessionId: string): string {
  return `meetup_code_${sessionId}`;
}

/** Booking Mongo id for `/chat/:donationId` — stashed when opening meetup from a booking so chat works if GET /meetups/:sessionId omits `bookingId`. */
export function meetupChatBookingStashKey(sessionId: string): string {
  return `meetup_chat_booking_${encodeURIComponent(sessionId)}`;
}

/** Stashed when the user opens the meetup flow from a booking that already has a meeting code. */
export function meetupBookingCodeStashKey(bookingId: string): string {
  return `meetup_booking_code_${encodeURIComponent(bookingId)}`;
}

/** Call from booking-row “Open meetup” so bootstrap can pass the code when POST /session omits it. */
export function stashMeetupCodeFromBookingRow(
  bookingId: string,
  meetingCode: string | number | null | undefined,
): void {
  try {
    const raw =
      typeof meetingCode === "number" && Number.isFinite(meetingCode)
        ? String(meetingCode).padStart(6, "0")
        : String(meetingCode ?? "");
    const d = raw.replace(/\D/g, "").slice(0, 6);
    if (d.length !== 6) return;
    sessionStorage.setItem(meetupBookingCodeStashKey(bookingId), d);
  } catch {
    /* private mode / quota */
  }
}
