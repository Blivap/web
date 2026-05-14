/** Meetup session lifecycle from GET /meetups/:sessionId (values normalized to lowercase when parsed). */
export type MeetupSessionStatus =
  | "active"
  | "completed"
  | "expired"
  | "cancelled"
  | string;

export type MeetupParticipant = {
  userId?: string;
  /** Present when API labels the current user’s role in the meetup. */
  role?: string;
  identityVerified?: boolean;
  /** True when this party has completed in-person verification (code or QR path). */
  meetupVerified?: boolean;
  donationConfirmed?: boolean;
};

export type MeetupSession = {
  id: string;
  status: MeetupSessionStatus;
  chatEnabled: boolean;
  expiresAt?: string | null;
  verificationCodeExpiresAt?: string | null;
  /** When true, the six-digit code path is available for this session. */
  codeVerificationEnabled?: boolean;
  /** When true, one-time QR verification is (or was) available. */
  qrVerificationEnabled?: boolean;
  requesterDonationConfirmed: boolean;
  donorDonationConfirmed: boolean;
  /** Six-digit code for in-person verification (often on nested `booking`). */
  meetingCode?: string | null;
  /** Present when the requester has verified the meetup code (or equivalent). */
  requesterCodeVerifiedAt?: string | null;
  /** Present when the donor has verified the meetup code (or equivalent). */
  donorCodeVerifiedAt?: string | null;
  /** Set when one-time QR verification was consumed. */
  qrConsumedAt?: string | null;
  /** Booking schedule context from the session payload. */
  scheduledAt?: string | null;
  hospitalId?: string | null;
  /** Explicit backend hint — parsed when present. */
  verificationGateSatisfied?: boolean;
  requesterUserId?: string;
  donorUserId?: string;
  me: MeetupParticipant;
  peer: MeetupParticipant;
  /**
   * Booking Mongo `_id` — same as `donationId` for Socket `/chat` and `GET /chat/:donationId/...`.
   * Not the meetup session id.
   */
  bookingId?: string;
};

export type MeetupEnsureSessionResponse = {
  alreadyExists: boolean;
  sessionId: string;
  meetingCode: string | null;
  qrToken: string | null;
};

export const MEETUP_REPORT_CATEGORIES = [
  "impersonation",
  "harassment",
  "unsafe_meetup",
  "no_show",
  "spam",
  "other",
] as const;

export type MeetupReportCategory = (typeof MEETUP_REPORT_CATEGORIES)[number];

export type MeetupReportPayload = {
  category: MeetupReportCategory;
  reason: string;
  details?: string;
};
