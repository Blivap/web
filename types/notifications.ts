/** Matches backend notification event types (frontend-notifications.txt). */
export type NotificationEventType =
  | "donor_matched"
  | "donor_approved"
  | "booking_request_sent"
  | "booking_accepted"
  | "booking_rejected"
  | "verification_approved"
  | "verification_rejected"
  | "profile_mismatch";

export type InAppNotification = {
  id: string;
  userId: string;
  type: NotificationEventType | string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
};

export type InAppNotificationListResponse = {
  message: string;
  data: InAppNotification[];
};

export type FcmPushSubscriptionPayload = {
  fcmToken: string;
  userAgent?: string;
};

export type WebPushSubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};
