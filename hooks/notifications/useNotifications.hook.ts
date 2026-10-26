import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import {
  acquireNotificationInbox,
  getNotificationInboxServerSnapshot,
  getNotificationInboxSnapshot,
  loadMoreNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refetchNotifications,
  subscribeNotificationInbox,
} from "@/lib/notifications/notificationInboxStore";
import type { InAppNotification } from "@/types/notifications";
import { useEffect, useSyncExternalStore } from "react";
import { useAppSelector } from "@/store/hooks";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  data: Record<string, unknown> | null | undefined;
  href: string | null;
};

function toViewItem(notification: InAppNotification): NotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.body,
    read: notification.readAt != null,
    createdAt: notification.createdAt,
    type: notification.type,
    data: notification.data ?? null,
    href: resolveNotificationHref(
      notification.type,
      notification.data ?? undefined,
    ),
  };
}

type UseNotificationsOptions = {
  /** When false (e.g. logged out), clears state and stops the live connection. */
  enabled: boolean;
  /**
   * Backup poll while the live socket is disconnected.
   * History still loads immediately. Pass 0 to disable the backup poll.
   */
  pollIntervalMs?: number;
};

export function useNotifications({
  enabled,
  pollIntervalMs,
}: UseNotificationsOptions) {
  const token = useAppSelector((state) => state.auth.token);
  const inbox = useSyncExternalStore(
    subscribeNotificationInbox,
    getNotificationInboxSnapshot,
    getNotificationInboxServerSnapshot,
  );

  useEffect(() => {
    if (!enabled) return;
    return acquireNotificationInbox({ token, pollIntervalMs });
  }, [enabled, token, pollIntervalMs]);

  const items = inbox.rows.map(toViewItem);
  const unreadCount = inbox.rows.filter((row) => row.readAt == null).length;

  return {
    items,
    unreadCount,
    hasMore: inbox.hasMore,
    isLoading: inbox.isLoading,
    isLoadingMore: inbox.isLoadingMore,
    isMarkingAllAsRead: inbox.isMarkingAllAsRead,
    error: inbox.error,
    refetch: refetchNotifications,
    loadMore: loadMoreNotifications,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead,
  };
}
