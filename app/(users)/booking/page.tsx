import { redirect } from "next/navigation";

/**
 * Legacy path: `/booking` → canonical `/bookings`.
 * Keeps old links working; all UI lives under `app/bookings/`.
 */
export default function LegacyBookingRedirect() {
  redirect("/bookings");
}
