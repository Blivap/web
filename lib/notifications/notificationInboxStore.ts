import { io, type Socket } from "socket.io-client";
import { $api } from "@/app/api";
import { config } from "@/config/env";
import type { InAppNotification } from "@/types/notifications";

const PAGE_SIZE = 30;
const DEFAULT_POLL_MS = 60_000;

const CREATED_EVENTS = [
  "notification:created",
  "notification:new",
  "notifications:created",
] as const;

const READ_EVENTS = ["notification:read", "notification:updated"] as const;

const READ_ALL_EVENTS = [
  "notification:read_all",
  "notifications:read_all",
] as const;

export type NotificationInboxSnapshot = {
  rows: InAppNotification[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMarkingAllAsRead: boolean;
  error: string | null;
  socketConnected: boolean;
};

const emptySnapshot: NotificationInboxSnapshot = {
  rows: [],
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  isMarkingAllAsRead: false,
  error: null,
  socketConnected: false,
};

let snapshot: NotificationInboxSnapshot = emptySnapshot;
const listeners = new Set<() => void>();

let subscribers = 0;
let epoch = 0;
let activeToken: string | null = null;
let pollIntervalMs = DEFAULT_POLL_MS;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let socket: Socket | null = null;
let visibilityBound = false;

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: NotificationInboxSnapshot) {
  snapshot = next;
  emit();
}

function patch(partial: Partial<NotificationInboxSnapshot>) {
  commit({ ...snapshot, ...partial });
}

export function subscribeNotificationInbox(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotificationInboxSnapshot() {
  return snapshot;
}

export function getNotificationInboxServerSnapshot() {
  return emptySnapshot;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseNotification(value: unknown): InAppNotification | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string" || !record.id.trim())
    return null;
  if (typeof record.title !== "string") return null;
  const body =
    typeof record.body === "string"
      ? record.body
      : typeof record.message === "string"
        ? record.message
        : "";
  const data = asRecord(record.data);
  return {
    id: record.id,
    userId: typeof record.userId === "string" ? record.userId : "",
    type: typeof record.type === "string" ? record.type : "",
    title: record.title,
    body,
    data,
    readAt: typeof record.readAt === "string" ? record.readAt : null,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date().toISOString(),
    ...(record.isDeleted === true ? { isDeleted: true } : {}),
  };
}

function unwrapNotification(payload: unknown): InAppNotification | null {
  const direct = parseNotification(payload);
  if (direct) return direct;
  const record = asRecord(payload);
  if (!record) return null;
  return (
    parseNotification(record.notification) ??
    parseNotification(record.data) ??
    null
  );
}

function mergePollResult(
  current: InAppNotification[],
  freshFirstPage: InAppNotification[],
): InAppNotification[] {
  const mergedHead = freshFirstPage.map((incoming) => {
    const existing = current.find((row) => row.id === incoming.id);
    if (existing?.readAt != null && incoming.readAt == null) {
      return { ...incoming, readAt: existing.readAt };
    }
    return incoming;
  });
  const headIds = new Set(mergedHead.map((row) => row.id));
  const tail = current.filter((row) => !headIds.has(row.id));
  return [...mergedHead, ...tail];
}

function upsertNotification(notification: InAppNotification) {
  if (notification.isDeleted) {
    patch({
      rows: snapshot.rows.filter((row) => row.id !== notification.id),
    });
    return;
  }
  const index = snapshot.rows.findIndex((row) => row.id === notification.id);
  if (index === -1) {
    patch({ rows: [notification, ...snapshot.rows] });
    return;
  }
  const existing = snapshot.rows[index]!;
  const next = snapshot.rows.slice();
  next[index] = {
    ...existing,
    ...notification,
    readAt: existing.readAt ?? notification.readAt,
  };
  patch({ rows: next });
}

async function loadFirstPage(opts?: { silent?: boolean }) {
  const silent = opts?.silent ?? false;
  const requestEpoch = epoch;
  try {
    if (!silent) patch({ isLoading: true, error: null });
    else patch({ error: null });
    const {
      data,
      status,
      error: apiError,
    } = await $api.notifications.list({
      skip: 0,
      limit: PAGE_SIZE,
    });
    if (requestEpoch !== epoch) return;
    const list = data?.data;
    if (status >= 200 && status < 300 && Array.isArray(list)) {
      const visible = list.filter((row) => row.isDeleted !== true);
      patch({
        rows: silent ? mergePollResult(snapshot.rows, visible) : visible,
        hasMore: list.length === PAGE_SIZE,
        isLoading: false,
        error: null,
      });
      return;
    }
    if (!silent) {
      patch({
        rows: [],
        hasMore: false,
        isLoading: false,
        error: apiError ?? "Unable to load notifications.",
      });
    }
  } catch (error) {
    if (requestEpoch !== epoch) return;
    if (!silent) {
      patch({
        rows: [],
        hasMore: false,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load notifications.",
      });
    }
  }
}

export async function loadMoreNotifications() {
  if (!snapshot.hasMore || snapshot.isLoadingMore || snapshot.isLoading) return;
  patch({ isLoadingMore: true, error: null });
  try {
    const {
      data,
      status,
      error: apiError,
    } = await $api.notifications.list({
      skip: snapshot.rows.length,
      limit: PAGE_SIZE,
    });
    const list = data?.data;
    if (status >= 200 && status < 300 && Array.isArray(list)) {
      const seen = new Set(snapshot.rows.map((row) => row.id));
      const visible = list.filter(
        (row) => row.isDeleted !== true && !seen.has(row.id),
      );
      patch({
        rows: [...snapshot.rows, ...visible],
        hasMore: list.length === PAGE_SIZE,
        isLoadingMore: false,
      });
      return;
    }
    patch({
      isLoadingMore: false,
      error: apiError ?? "Unable to load more notifications.",
    });
  } catch (error) {
    patch({
      isLoadingMore: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load more notifications.",
    });
  }
}

export async function markNotificationRead(id: string) {
  const previous = snapshot.rows;
  const now = new Date().toISOString();
  patch({
    error: null,
    rows: snapshot.rows.map((row) =>
      row.id === id ? { ...row, readAt: now } : row,
    ),
  });
  try {
    const { status, error: apiError } = await $api.notifications.markRead(id);
    if (status < 200 || status >= 300) {
      patch({
        rows: previous,
        error: apiError ?? "Could not mark notification as read.",
      });
    }
  } catch {
    patch({ rows: previous, error: "Could not mark notification as read." });
  }
}

export async function markAllNotificationsRead() {
  const hasUnread = snapshot.rows.some((row) => row.readAt == null);
  if (!hasUnread || snapshot.isMarkingAllAsRead) return;
  const previous = snapshot.rows;
  const now = new Date().toISOString();
  patch({
    error: null,
    isMarkingAllAsRead: true,
    rows: snapshot.rows.map((row) =>
      row.readAt == null ? { ...row, readAt: now } : row,
    ),
  });
  try {
    const { status, error: apiError } = await $api.notifications.markAllRead();
    if (status < 200 || status >= 300) {
      patch({
        rows: previous,
        isMarkingAllAsRead: false,
        error: apiError ?? "Could not mark all notifications as read.",
      });
      return;
    }
    await loadFirstPage({ silent: true });
  } catch {
    patch({
      rows: previous,
      error: "Could not mark all notifications as read.",
    });
  } finally {
    patch({ isMarkingAllAsRead: false });
  }
}

export function refetchNotifications() {
  return loadFirstPage();
}

const toastListeners = new Set<(notification: InAppNotification) => void>();

export function subscribeNotificationToasts(
  listener: (notification: InAppNotification) => void,
) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

function publishToast(notification: InAppNotification) {
  for (const listener of toastListeners) listener(notification);
}

function onCreated(payload: unknown) {
  const notifications = Array.isArray(payload) ? payload : [payload];
  for (const item of notifications) {
    const parsed = unwrapNotification(item);
    if (!parsed || parsed.isDeleted) continue;
    const alreadySeen = snapshot.rows.some((row) => row.id === parsed.id);
    upsertNotification(parsed);
    if (!alreadySeen) publishToast(parsed);
  }
}

function onRead(payload: unknown) {
  const record = asRecord(payload);
  const nested = asRecord(record?.notification) ?? asRecord(record?.data);
  const source = nested ?? record;
  const id = typeof source?.id === "string" ? source.id : null;
  if (!id) return;
  const readAt =
    typeof source?.readAt === "string"
      ? source.readAt
      : new Date().toISOString();
  patch({
    rows: snapshot.rows.map((row) =>
      row.id === id ? { ...row, readAt } : row,
    ),
  });
}

function onReadAll(payload: unknown) {
  const record = asRecord(payload);
  const readAt =
    typeof record?.readAt === "string"
      ? record.readAt
      : new Date().toISOString();
  patch({
    rows: snapshot.rows.map((row) =>
      row.readAt == null ? { ...row, readAt } : row,
    ),
  });
}

function bindSocketEvents(current: Socket) {
  for (const event of CREATED_EVENTS) current.on(event, onCreated);
  for (const event of READ_EVENTS) current.on(event, onRead);
  for (const event of READ_ALL_EVENTS) current.on(event, onReadAll);
}

function connectSocket(token: string) {
  socket?.removeAllListeners();
  socket?.disconnect();
  const base = config.apiUrl.replace(/\/$/, "");
  const next = io(`${base}/notifications`, {
    path: "/socket.io",
    autoConnect: false,
    auth: {
      token,
      accessToken: token,
      bearerToken: `Bearer ${token}`,
    },
    query: {
      token,
      access_token: token,
    },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  socket = next;
  bindSocketEvents(next);
  next.on("connect", () => {
    patch({ socketConnected: true });
    next.emit("notifications:subscribe", { token, accessToken: token });
    void loadFirstPage({ silent: snapshot.rows.length > 0 });
  });
  next.on("disconnect", () => patch({ socketConnected: false }));
  next.on("connect_error", () => patch({ socketConnected: false }));
  next.connect();
}

function disconnectSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  if (snapshot.socketConnected) patch({ socketConnected: false });
}

function onVisibility() {
  if (document.visibilityState !== "visible" || subscribers === 0) return;
  if (!snapshot.socketConnected) void loadFirstPage({ silent: true });
}

function ensureVisibilityListener() {
  if (visibilityBound || typeof document === "undefined") return;
  document.addEventListener("visibilitychange", onVisibility);
  visibilityBound = true;
}

function stopVisibilityListener() {
  if (!visibilityBound || typeof document === "undefined") return;
  document.removeEventListener("visibilitychange", onVisibility);
  visibilityBound = false;
}

function restartPoll() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  if (subscribers === 0 || pollIntervalMs <= 0) return;
  pollTimer = setInterval(() => {
    if (snapshot.socketConnected) return;
    if (
      typeof document !== "undefined" &&
      document.visibilityState !== "visible"
    ) {
      return;
    }
    void loadFirstPage({ silent: true });
  }, pollIntervalMs);
}

export function acquireNotificationInbox(options: {
  token: string | null;
  pollIntervalMs?: number;
}) {
  subscribers += 1;
  pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
  const token = options.token?.trim() || null;
  if (subscribers === 1) {
    void loadFirstPage();
    ensureVisibilityListener();
    restartPoll();
  }
  if (token !== activeToken) {
    activeToken = token;
    if (token) connectSocket(token);
    else disconnectSocket();
  }
  return () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers > 0) return;
    epoch += 1;
    disconnectSocket();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    stopVisibilityListener();
    activeToken = null;
    commit({ ...emptySnapshot });
  };
}
