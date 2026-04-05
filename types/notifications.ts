/** Matches backend notification event types (frontend-notifications.txt). */
export type NotificationEventType =
  | "donor_matched"
  | "booking_request_sent"
  | "booking_accepted"
  | "booking_rejected"
  | "verification_approved"
  | "verification_rejected";

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
