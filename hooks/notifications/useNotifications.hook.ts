import { $api } from "@/api";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import type { InAppNotification } from "@/types/notifications";
import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 30;
const DEFAULT_POLL_MS = 60_000;

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

function toViewItem(n: InAppNotification): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    read: n.readAt != null,
    createdAt: n.createdAt,
    type: n.type,
    data: n.data ?? null,
    href: resolveNotificationHref(n.type, n.data ?? undefined),
  };
}

type UseNotificationsOptions = {
  /** When false (e.g. logged out), clears state and stops polling. */
  enabled: boolean;
  /** Polling interval for the first page; 0 disables polling. */
  pollIntervalMs?: number;
};

export function useNotifications({
  enabled,
  pollIntervalMs = DEFAULT_POLL_MS,
}: UseNotificationsOptions) {
  const [rows, setRows] = useState<InAppNotification[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      const {
        data,
        status,
        error: apiError,
      } = await $api.notifications.list({ skip: 0, limit: PAGE_SIZE });
      const list = data?.data;
      if (status >= 200 && status < 300 && Array.isArray(list)) {
        setRows(list);
        setHasMore(list.length === PAGE_SIZE);
        return;
      }
      setRows([]);
      setHasMore(false);
      setError(apiError ?? "Unable to load notifications.");
    } catch (e) {
      setRows([]);
      setHasMore(false);
      setError(
        e instanceof Error ? e.message : "Unable to load notifications.",
      );
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      setHasMore(false);
      setError(null);
      return;
    }
    void loadFirstPage();
  }, [enabled, loadFirstPage]);

  useEffect(() => {
    if (!enabled || pollIntervalMs <= 0) return;

    const id = setInterval(() => {
      void loadFirstPage({ silent: true });
    }, pollIntervalMs);

    return () => clearInterval(id);
  }, [enabled, pollIntervalMs, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    setError(null);
    try {
      const {
        data,
        status,
        error: apiError,
      } = await $api.notifications.list({
        skip: rows.length,
        limit: PAGE_SIZE,
      });
      const list = data?.data;
      if (status >= 200 && status < 300 && Array.isArray(list)) {
        setRows((r) => [...r, ...list]);
        setHasMore(list.length === PAGE_SIZE);
        return;
      }
      setError(apiError ?? "Unable to load more notifications.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load more notifications.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isLoading, rows.length]);

  const markAsRead = useCallback(
    async (id: string) => {
      setError(null);
      const prev = rows;
      const now = new Date().toISOString();
      setRows((r) => r.map((n) => (n.id === id ? { ...n, readAt: now } : n)));
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
        await loadFirstPage();
        setError("Some notifications could not be marked as read.");
      }
    } catch {
      await loadFirstPage();
      setError("Could not mark all notifications as read.");
    }
  }, [rows, loadFirstPage]);

  const items = rows.map(toViewItem);
  const unreadCount = rows.filter((n) => n.readAt == null).length;

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    refetch: () => loadFirstPage(),
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
