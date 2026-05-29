/** Aligns with backend booking lifecycle (some statuses may only appear from other services). */
export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired"
  | "completed"
  | "no_show";

/** Optional filters for GET /bookings/sent and GET /bookings/received. */
export type BookingListQuery = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  scheduledFrom?: string;
  scheduledTo?: string;
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
  slotEndAt?: string | null;
  status: BookingStatus;
  meetingCode?: string | null;
  bloodRequestId?: string | null;
  respondedAt?: string | null;
  /** Present when API populates `donorUserId` as an embedded user object. */
  donorDisplayName?: string;
  donorProfileImage?: string | null;
  /** Present when API populates `requesterId` as an embedded user object. */
  requesterDisplayName?: string;
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
