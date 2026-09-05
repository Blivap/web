import { $api } from "@/app/api";
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

/** Silent poll replaces the first page from the server; preserve optimistic readAt and tail rows from loadMore. */
function mergePollResult(
  current: InAppNotification[],
  freshFirstPage: InAppNotification[],
): InAppNotification[] {
  const mergedHead = freshFirstPage.map((inc) => {
    const existing = current.find((n) => n.id === inc.id);
    if (existing?.readAt != null && inc.readAt == null) {
      return { ...inc, readAt: existing.readAt };
    }
    return inc;
  });

  const headIds = new Set(mergedHead.map((n) => n.id));
  const tail = current.filter((n) => !headIds.has(n.id));
  return [...mergedHead, ...tail];
}

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
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
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
        const visible = list.filter((n) => n.isDeleted !== true);
        if (visible.length === 0) {
          setRows([]);
          setHasMore(false);
          return;
        }
        setRows((current) =>
          silent ? mergePollResult(current, visible) : visible,
        );
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
      // Avoid unnecessary background polling when the tab is hidden.
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }
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
        const visible = list.filter((n) => n.isDeleted !== true);
        setRows((r) => [...r, ...visible]);
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

  const markAsRead = useCallback(async (id: string) => {
    setError(null);
    let previous: InAppNotification[] = [];

    setRows((r) => {
      previous = r;
      const now = new Date().toISOString();
      return r.map((n) => (n.id === id ? { ...n, readAt: now } : n));
    });

    try {
      const { status, error: apiError } = await $api.notifications.markRead(id);
      if (status < 200 || status >= 300) {
        setRows(previous);
        setError(apiError ?? "Could not mark notification as read.");
      }
    } catch {
      setRows(previous);
      setError("Could not mark notification as read.");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const hasUnread = rows.some((n) => n.readAt == null);
    if (!hasUnread || isMarkingAllAsRead) return;

    setError(null);
    setIsMarkingAllAsRead(true);
    let previous: InAppNotification[] = [];

    setRows((r) => {
      previous = r;
      const now = new Date().toISOString();
      return r.map((n) => (n.readAt == null ? { ...n, readAt: now } : n));
    });

    try {
      const { status, error: apiError } =
        await $api.notifications.markAllRead();
      if (status < 200 || status >= 300) {
        setRows(previous);
        setError(apiError ?? "Could not mark all notifications as read.");
        return;
      }
      await loadFirstPage({ silent: true });
    } catch {
      setRows(previous);
      setError("Could not mark all notifications as read.");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [rows, isMarkingAllAsRead, loadFirstPage]);

  const items = rows.map(toViewItem);
  const unreadCount = rows.filter((n) => n.readAt == null).length;
  const refetch = useCallback(() => loadFirstPage(), [loadFirstPage]);

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    isMarkingAllAsRead,
    error,
    refetch,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
