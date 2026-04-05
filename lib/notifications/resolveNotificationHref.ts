import { routes, donorDetailPath } from "@/config/routes";
import type { NotificationEventType } from "@/types/notifications";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/**
 * Maps backend notification type + data to an in-app path for Next.js navigation.
 * Aligns with NotificationEventType and typical payload fields (e.g. bookingId).
 */
export function resolveNotificationHref(
  type: NotificationEventType | string,
  data: Record<string, unknown> | null | undefined,
): string | null {
  const d = data ?? {};
  const bookingId = str(d.bookingId);
  const donorId = str(d.donorId);
  const bloodRequestId = str(d.bloodRequestId);
  const directUrl = str(d.url);

  if (directUrl?.startsWith("/")) {
    return directUrl;
  }

  switch (type) {
    case "donor_matched":
      if (donorId) return donorDetailPath(donorId);
      if (bloodRequestId) return `${routes.bookings}?bloodRequestId=${encodeURIComponent(bloodRequestId)}`;
      return routes.bookings;

    case "booking_request_sent":
    case "booking_accepted":
    case "booking_rejected":
      if (bookingId) {
        return `${routes.bookings}?bookingId=${encodeURIComponent(bookingId)}`;
      }
      return routes.bookings;

    case "verification_approved":
    case "verification_rejected":
      return routes.verifyId();

    default:
      return null;
  }
}
