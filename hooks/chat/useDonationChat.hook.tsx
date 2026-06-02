"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, type Socket } from "socket.io-client";
import { config } from "@/config/env";
import { $api } from "@/app/api";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { parseChatMessagesResponse } from "@/lib/chat/parseChatMessagesResponse";
import type { DonationChatMessage } from "@/types/donation-chat";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  absorbSocketDonationChatPayload,
  appendDonationChatOptimistic,
  clearDonationChatMessages,
  mergeDonationChatHistory,
  resetDonationChatRoom,
  stripDonationChatOptimistic,
} from "@/store/slices/donationChatSlice";

function getChatErrorText(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const m = o.message;
    if (typeof m === "string" && m.trim()) return m.trim();
    const err = o.error;
    if (typeof err === "string" && err.trim()) return err.trim();
  }
  return "Something went wrong with chat.";
}

/** Parsed `chat:error` payload (Nest often sends `{ status, message }`). */
function parseSocketChatErrorMeta(payload: unknown): {
  status?: number;
  message: string;
  code?: string;
} {
  if (typeof payload === "string") {
    const message = payload.trim() || "Something went wrong with chat.";
    return { message };
  }
  if (!payload || typeof payload !== "object") {
    return { message: "Something went wrong with chat." };
  }
  const o = payload as Record<string, unknown>;
  const status = typeof o.status === "number" ? o.status : undefined;
  const code = typeof o.code === "string" ? o.code : undefined;
  const message = getChatErrorText(payload);
  return { status, message, code };
}

function isChatClosedSocketMeta(meta: {
  status?: number;
  message: string;
}): boolean {
  if (meta.status === 403) return true;
  const m = meta.message.toLowerCase();
  return (
    m.includes("chat is closed") ||
    m.includes("room is closed") ||
    m.includes("room closed")
  );
}

/** Real JWT/session failure from the chat gateway (not the same as “room closed”). */
function isSocketChatAuthFailure(meta: {
  message: string;
  code?: string;
}): boolean {
  const c = meta.code?.toLowerCase();
  if (c === "unauthorized") return true;
  const m = meta.message.toLowerCase();
  return m === "not authenticated" || m.includes("jwt expired");
}

/**
 * Socket `chat:error` sometimes mirrors forbidden / closed room as generic HTTP-ish text.
 * Do not treat real auth failures here — use `isSocketChatAuthFailure` first.
 */
function isForbiddenChatSocketNoise(meta: { message: string }): boolean {
  const m = meta.message.toLowerCase();
  return m === "unauthorized" || m.includes("forbidden");
}

export type UseDonationChatArgs = {
  /** Booking Mongo `_id` — must match server chat room (not meetup session id). */
  donationId: string | undefined;
  accessToken: string | null | undefined;
  enabled: boolean;
  /** Current user id — used for optimistic send bubbles until the server echoes. */
  viewerUserId?: string | null;
};

/**
 * Some gateways emit `(donationId, message)`; others emit a single object.
 * Optional envelope `donationId` / `bookingId` — skip when it targets another room.
 */
function envelopeDonationId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const v = o.donationId ?? o.bookingId ?? o.booking_id;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Server gateways vary; subscribe to all and de-dupe by message id in state. */
const CHAT_MESSAGE_SOCKET_EVENTS = [
  "chat:message",
  "message",
  "newMessage",
  "new_message",
  "chat:newMessage",
  "chat:new_message",
  "ChatMessage",
  "chatMessage",
  "donation_chat:message",
] as const;

const EMPTY_MESSAGES: DonationChatMessage[] = [];

export function useDonationChat({
  donationId,
  accessToken,
  enabled,
  viewerUserId,
}: UseDonationChatArgs) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) =>
    donationId
      ? (s.donationChat.rooms[donationId]?.messages ?? EMPTY_MESSAGES)
      : EMPTY_MESSAGES,
  );
  const nextCursor = useAppSelector((s) =>
    donationId ? (s.donationChat.rooms[donationId]?.nextCursor ?? null) : null,
  );

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [roomClosed, setRoomClosed] = useState(false);
  const [roomCloseReason, setRoomCloseReason] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [arrivedRecorded, setArrivedRecorded] = useState(false);
  const [arrivedBusy, setArrivedBusy] = useState(false);
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const [sendBusy, setSendBusy] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typingHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingEmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const donationIdRef = useRef(donationId);
  donationIdRef.current = donationId;
  const viewerUserIdRef = useRef(viewerUserId);
  viewerUserIdRef.current = viewerUserId;
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;
  /** Last optimistic row id (cleared when a server message replaces it or on recoverable error). */
  const lastOutgoingOptimisticRef = useRef<{ id: string } | null>(null);
  const prevDonationIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevDonationIdRef.current;
    prevDonationIdRef.current = donationId;
    if (prev && prev !== donationId) {
      dispatch(resetDonationChatRoom({ donationId: prev }));
    }
  }, [donationId, dispatch]);

  const fetchHistory = useCallback(
    async (opts?: { before?: string }) => {
      const id = donationIdRef.current;
      if (!id) return;
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const { status, data } = await $api.chat.messages(id, {
          limit: 50,
          ...(opts?.before ? { before: opts.before } : {}),
        });
        if (status === 403) {
          setRoomClosed(true);
          setRoomCloseReason(
            getApiMessageFromData(data) ?? "This chat is closed.",
          );
          if (!opts?.before) {
            dispatch(clearDonationChatMessages({ donationId: id }));
          }
          return;
        }
        if (status < 200 || status >= 300) {
          const msg =
            getApiMessageFromData(data) ?? "Could not load chat history.";
          if (!opts?.before) setHistoryError(msg);
          return;
        }
        setRoomClosed(false);
        setRoomCloseReason(null);
        const { messages: chunk, nextCursor: cursor } =
          parseChatMessagesResponse(data);
        dispatch(
          mergeDonationChatHistory({
            donationId: id,
            messages: chunk,
            nextCursor: cursor,
            prepend: Boolean(opts?.before),
          }),
        );
      } catch (e) {
        /** GET /chat/.../messages returns 403 when the room is closed; axios rejects non-2xx so this never hits `status === 403` above. */
        if (axios.isAxiosError(e) && e.response?.status === 403) {
          setRoomClosed(true);
          setRoomCloseReason(
            getApiMessageFromData(e.response.data) ?? "Chat is closed.",
          );
          if (!opts?.before) {
            setHistoryError(null);
            dispatch(clearDonationChatMessages({ donationId: id }));
          }
          return;
        }
        if (!opts?.before) {
          setHistoryError(
            getAxiosErrorMessage(e, "Could not load chat history."),
          );
        }
      } finally {
        setHistoryLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!enabled || !donationId || !accessToken) {
      setSocketConnected(false);
      return;
    }

    const base = config.apiUrl.replace(/\/$/, "");
    const socket = io(`${base}/chat`, {
      path: "/socket.io",
      autoConnect: false,
      /** Backends differ: handshake `auth`, query string, or per-event `token`. */
      auth: {
        token: accessToken,
        accessToken: accessToken,
        bearerToken: `Bearer ${accessToken}`,
      },
      query: {
        token: accessToken,
        access_token: accessToken,
      },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
    });
    socketRef.current = socket;

    const handleIncomingMessage = (...args: unknown[]) => {
      const roomId = donationIdRef.current;
      if (!roomId) return;

      if (
        args.length >= 2 &&
        typeof args[0] === "string" &&
        args[0].trim() === roomId &&
        args[1] != null &&
        typeof args[1] !== "function"
      ) {
        dispatch(
          absorbSocketDonationChatPayload({
            donationId: roomId,
            payload: args[1],
          }),
        );
        return;
      }

      if (
        args.length >= 2 &&
        typeof args[1] === "string" &&
        args[1].trim() === roomId &&
        args[0] != null &&
        typeof args[0] !== "function"
      ) {
        dispatch(
          absorbSocketDonationChatPayload({
            donationId: roomId,
            payload: args[0],
          }),
        );
        return;
      }

      for (const payload of args) {
        if (payload === undefined || typeof payload === "function") continue;
        const envId = envelopeDonationId(payload);
        if (envId && envId !== roomId) continue;
        dispatch(
          absorbSocketDonationChatPayload({ donationId: roomId, payload }),
        );
      }
    };

    const onRoomClosed = (payload: unknown) => {
      const roomId = donationIdRef.current;
      if (!roomId) return;
      if (!payload || typeof payload !== "object") {
        lastOutgoingOptimisticRef.current = null;
        dispatch(
          stripDonationChatOptimistic({ donationId: roomId, all: true }),
        );
        setRoomClosed(true);
        return;
      }
      const d = (payload as Record<string, unknown>).donationId;
      if (typeof d === "string" && d !== roomId) return;
      lastOutgoingOptimisticRef.current = null;
      dispatch(stripDonationChatOptimistic({ donationId: roomId, all: true }));
      setRoomClosed(true);
      const reason = (payload as { reason?: unknown }).reason;
      setRoomCloseReason(
        typeof reason === "string" && reason.trim() ? reason.trim() : null,
      );
      setTypingLabel(null);
    };

    const onRoomOpened = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;
      const d = (payload as Record<string, unknown>).donationId;
      if (typeof d !== "string" || d !== donationIdRef.current) return;
      void fetchHistory();
    };

    const onChatError = (payload: unknown) => {
      setSendBusy(false);
      const roomId = donationIdRef.current;
      const meta = parseSocketChatErrorMeta(payload);
      if (isSocketChatAuthFailure(meta)) {
        setSendError(
          meta.message.trim()
            ? meta.message
            : "Chat could not verify your session. Try refreshing the page.",
        );
        setRoomCloseReason(null);
        return;
      }
      if (isChatClosedSocketMeta(meta)) {
        if (roomId) {
          lastOutgoingOptimisticRef.current = null;
          dispatch(
            stripDonationChatOptimistic({ donationId: roomId, all: true }),
          );
        }
        setRoomClosed(true);
        const reason =
          meta.status === 403 && isForbiddenChatSocketNoise(meta)
            ? "Chat is closed."
            : meta.message;
        setRoomCloseReason(reason);
        setSendError(null);
        setTypingLabel(null);
        return;
      }
      if (isForbiddenChatSocketNoise(meta)) {
        if (roomId) {
          lastOutgoingOptimisticRef.current = null;
          dispatch(
            stripDonationChatOptimistic({ donationId: roomId, all: true }),
          );
        }
        setRoomClosed(true);
        setRoomCloseReason("Chat is closed.");
        setSendError(null);
        setTypingLabel(null);
        return;
      }
      const drop = lastOutgoingOptimisticRef.current;
      lastOutgoingOptimisticRef.current = null;
      if (drop && roomId) {
        dispatch(
          stripDonationChatOptimistic({ donationId: roomId, id: drop.id }),
        );
      }
      setSendError(meta.message);
    };

    const onTyping = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;
      const d = (payload as Record<string, unknown>).donationId;
      if (typeof d !== "string" || d !== donationIdRef.current) return;
      const roleLabel = (payload as { roleLabel?: unknown }).roleLabel;
      const typing = Boolean((payload as { typing?: unknown }).typing);
      if (!typing) {
        setTypingLabel(null);
        return;
      }
      if (typeof roleLabel === "string" && roleLabel.trim()) {
        setTypingLabel(roleLabel.trim());
        if (typingHideTimerRef.current)
          clearTimeout(typingHideTimerRef.current);
        typingHideTimerRef.current = setTimeout(() => {
          setTypingLabel(null);
          typingHideTimerRef.current = null;
        }, 2800);
      }
    };

    socket.on("connect_error", (err: unknown) => {
      setSocketConnected(false);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Chat connection failed.";
      setSendError(msg.trim() ? msg : "Chat connection failed.");
    });

    for (const ev of CHAT_MESSAGE_SOCKET_EVENTS) {
      socket.on(ev, handleIncomingMessage);
    }
    socket.on("chat:room_closed", onRoomClosed);
    socket.on("chat:room_opened", onRoomOpened);
    socket.on("chat:error", onChatError);
    socket.on("chat:typing", onTyping);

    socket.on("connect", () => {
      setSocketConnected(true);
      setSendError(null);
      const id = donationIdRef.current;
      if (id) {
        const t = accessTokenRef.current;
        socket.emit("chat:join", {
          donationId: id,
          ...(t ? { token: t, accessToken: t } : {}),
        });
      }
      void fetchHistory();
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.connect();

    return () => {
      for (const ev of CHAT_MESSAGE_SOCKET_EVENTS) {
        socket.off(ev, handleIncomingMessage);
      }
      socket.off("chat:room_closed", onRoomClosed);
      socket.off("chat:room_opened", onRoomOpened);
      socket.off("chat:error", onChatError);
      socket.off("chat:typing", onTyping);
      const id = donationIdRef.current;
      if (id && socket.connected) {
        const t = accessTokenRef.current;
        socket.emit("chat:leave", {
          donationId: id,
          ...(t ? { token: t, accessToken: t } : {}),
        });
      }
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
    };
  }, [enabled, donationId, accessToken, fetchHistory, dispatch]);

  useEffect(() => {
    if (!enabled || !donationId || !accessToken) {
      lastOutgoingOptimisticRef.current = null;
      if (donationId) {
        dispatch(resetDonationChatRoom({ donationId }));
      }
      setHistoryError(null);
      setRoomClosed(false);
      setRoomCloseReason(null);
      setArrivedRecorded(false);
      setTypingLabel(null);
      setSendError(null);
    }
  }, [enabled, donationId, accessToken, dispatch]);

  const sendText = useCallback(
    (text: string) => {
      const id = donationId;
      const s = socketRef.current;
      if (!id || !s?.connected) {
        return { ok: false as const, message: "Chat is not available." };
      }
      const trimmed = text.trim();
      if (!trimmed) {
        return { ok: false as const, message: "Message is empty." };
      }
      setSendBusy(true);
      setSendError(null);
      const viewer = viewerUserIdRef.current?.trim();
      if (viewer) {
        const optimisticId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        lastOutgoingOptimisticRef.current = { id: optimisticId };
        dispatch(
          appendDonationChatOptimistic({
            donationId: id,
            message: {
              id: optimisticId,
              text: trimmed,
              createdAt: new Date().toISOString(),
              senderUserId: viewer,
            },
          }),
        );
      }
      const t = accessTokenRef.current;
      s.emit("chat:send", {
        donationId: id,
        text: trimmed,
        ...(t ? { token: t, accessToken: t } : {}),
      });
      window.setTimeout(() => setSendBusy(false), 1500);
      return { ok: true as const };
    },
    [donationId, dispatch],
  );

  const notifyTyping = useCallback(
    (typing: boolean) => {
      const id = donationId;
      const s = socketRef.current;
      if (!id || !s?.connected) return;
      const t = accessTokenRef.current;
      s.emit("chat:typing", {
        donationId: id,
        typing,
        ...(t ? { token: t, accessToken: t } : {}),
      });
    },
    [donationId],
  );

  const onComposerTyping = useCallback(() => {
    notifyTyping(true);
    if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
    typingEmitTimerRef.current = setTimeout(() => {
      notifyTyping(false);
      typingEmitTimerRef.current = null;
    }, 1200);
  }, [notifyTyping]);

  const markArrived = useCallback(async () => {
    if (!donationId) {
      return { ok: false as const, message: "Missing booking." };
    }
    setArrivedBusy(true);
    try {
      const { status, data } = await $api.chat.arrived(donationId);
      if (status < 200 || status >= 300) {
        return {
          ok: false as const,
          message:
            getApiMessageFromData(data) ?? "Could not record your arrival.",
        };
      }
      setArrivedRecorded(true);
      void fetchHistory();
      return { ok: true as const };
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        const msg =
          getApiMessageFromData(e.response.data) ??
          "Chat is closed — arrival could not be recorded.";
        setRoomClosed(true);
        setRoomCloseReason(msg);
        return { ok: false as const, message: msg };
      }
      return {
        ok: false as const,
        message: getAxiosErrorMessage(e, "Could not record your arrival."),
      };
    } finally {
      setArrivedBusy(false);
    }
  }, [donationId, fetchHistory]);

  const clearSendError = useCallback(() => setSendError(null), []);

  const loadOlderMessages = useCallback(() => {
    if (nextCursor) void fetchHistory({ before: nextCursor });
  }, [nextCursor, fetchHistory]);

  return {
    messages,
    nextCursor,
    historyLoading,
    historyError,
    sendError,
    clearSendError,
    roomClosed,
    roomCloseReason,
    socketConnected,
    arrivedRecorded,
    arrivedBusy,
    markArrived,
    sendText,
    sendBusy,
    typingLabel,
    onComposerTyping,
    loadOlderMessages,
    refetchHistory: fetchHistory,
  };
}
