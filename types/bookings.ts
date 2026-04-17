/** Aligns with backend booking lifecycle (some statuses may only appear from other services). */
export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no_show";

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
