import type { Booking, BookingStatus } from "@/types/bookings";

const RESPONDED_STATUSES = new Set<BookingStatus>([
  "accepted",
  "rejected",
  "cancelled",
  "completed",
  "expired",
  "no_show",
]);

function mergeBookingRow(local: Booking, server: Booking): Booking {
  if (
    local.respondedAt &&
    server.status === "pending" &&
    RESPONDED_STATUSES.has(local.status)
  ) {
    return {
      ...server,
      status: local.status,
      respondedAt: local.respondedAt,
      meetingCode: local.meetingCode ?? server.meetingCode,
    };
  }
  return server;
}

/** Keeps optimistic accept/decline visible until the server list catches up. */
export function mergeBookingsList(
  localItems: Booking[],
  serverItems: Booking[],
): Booking[] {
  const serverById = new Map(serverItems.map((b) => [b.id, b]));
  const seen = new Set<string>();
  const merged: Booking[] = [];

  for (const local of localItems) {
    const server = serverById.get(local.id);
    seen.add(local.id);
    merged.push(server ? mergeBookingRow(local, server) : local);
  }

  for (const server of serverItems) {
    if (!seen.has(server.id)) merged.push(server);
  }

  return merged;
}
