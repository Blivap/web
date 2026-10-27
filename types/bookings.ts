/** Aligns with backend booking lifecycle (some statuses may only appear from other services). */
export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired"
  | "completed"
  | "no_show";

/** Optional filters for GET /bookings. */
export type BookingListQuery = {
  page?: number;
  limit?: number;
  /** Bookings screen filter: incoming, outgoing, pending, confirmed, and so on. */
  filter?: string;
  /** Calendar day `YYYY-MM-DD`. */
  date?: string;
};

export type BookingsListMeta = {
  page: number;
  limit: number;
  total: number;
};

export type Booking = {
  id: string;
  donorUserId: string;
  requesterId: string;
  hospitalId: string;
  scheduledAt: string;
  /** When the booking record was created. */
  createdAt?: string | null;
  /** Set by GET /bookings when the row is incoming or outgoing. */
  direction?: "incoming" | "outgoing" | null;
  slotEndAt?: string | null;
  status: BookingStatus;
  meetingCode?: string | null;
  bloodRequestId?: string | null;
  respondedAt?: string | null;
  /** Present when API populates `donorUserId` as an embedded user object. */
  donorDisplayName?: string;
  /** Anonymous 8-character handle when the donor user is embedded. */
  donorPublicId?: string;
  donorProfileImage?: string | null;
  /** Present when API populates `requesterId` as an embedded user object. */
  requesterDisplayName?: string;
  /** Anonymous 8-character handle when the requester user is embedded. */
  requesterPublicId?: string;
  requesterProfileImage?: string | null;
  /** Present when API populates `hospitalId` as an embedded hospital object. */
  hospitalName?: string;
  /** From API `reports` array length — trust & safety reports on this booking. */
  reportsCount?: number;
  /** True when the requester has submitted POST /bookings/:id/rating. */
  requesterHasRated?: boolean;
};

export type CreateBookingPayload = {
  donorUserId: string;
  hospitalId: string;
  scheduledAt: string;
  bloodRequestId?: string;
};

export type RespondBookingPayload = {
  accept: boolean;
};

export type ReportBookingPayload = {
  reason: string;
  details?: string;
};
