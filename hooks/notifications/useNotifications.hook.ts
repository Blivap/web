import { $api } from "@/api";
import type { InAppNotification } from "@/types/notifications";
import { useCallback, useEffect, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function toViewItem(n: InAppNotification): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    read: n.readAt != null,
    createdAt: n.createdAt,
  };
}

type UseNotificationsOptions = {
  /** When true (e.g. bell panel open), fetches the list. */
  enabled: boolean;
};

export function useNotifications({ enabled }: UseNotificationsOptions) {
  const [rows, setRows] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, status, error: apiError } =
        await $api.notifications.list();
      const list = data?.data;
      if (status >= 200 && status < 300 && Array.isArray(list)) {
        setRows(list);
        return;
      }
      setRows([]);
      setError(apiError ?? "Unable to load notifications.");
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  const markAsRead = useCallback(
    async (id: string) => {
      setError(null);
      const prev = rows;
      const now = new Date().toISOString();
      setRows((r) =>
        r.map((n) => (n.id === id ? { ...n, readAt: now } : n)),
      );
      try {
        const { status, error: apiError } =
          await $api.notifications.markRead(id);
        if (status < 200 || status >= 300) {
          setRows(prev);
          setError(apiError ?? "Could not mark notification as read.");
        }
      } catch {
        setRows(prev);
        setError("Could not mark notification as read.");
      }
    },
    [rows],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = rows.filter((n) => n.readAt == null).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setError(null);
    const prev = rows;
    const now = new Date().toISOString();
    setRows((r) =>
      r.map((n) => (n.readAt == null ? { ...n, readAt: now } : n)),
    );

    try {
      const results = await Promise.all(
        unreadIds.map((id) => $api.notifications.markRead(id)),
      );
      const failed = results.some(
        (res) => res.status < 200 || res.status >= 300,
      );
      if (failed) {
        await load();
        setError("Some notifications could not be marked as read.");
      }
    } catch {
      await load();
      setError("Could not mark all notifications as read.");
    }
  }, [rows, load]);

  const items = rows.map(toViewItem);

  return {
    items,
    isLoading,
    error,
    refetch: load,
    markAsRead,
    markAllAsRead,
  };
}
