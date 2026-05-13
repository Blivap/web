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
import {
  parseChatMessagesResponse,
  parseDonationChatMessageRecord,
} from "@/lib/chat/parseChatMessagesResponse";
import type { DonationChatMessage } from "@/types/donation-chat";

function sortMessages(a: DonationChatMessage, b: DonationChatMessage): number {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

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
  const message = getChatErrorText(payload);
  return { status, message };
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

/**
 * Socket `chat:error` sometimes returns auth-shaped copy for forbidden / closed
 * room; treat as closed so the UI matches GET /chat/.../messages 403.
 */
function isForbiddenChatSocketNoise(meta: { message: string }): boolean {
  const m = meta.message.toLowerCase();
  return (
    m.includes("not authenticated") ||
    m === "unauthorized" ||
    m.includes("forbidden")
  );
}

export type UseDonationChatArgs = {
  donationId: string | undefined;
  accessToken: string | null | undefined;
  enabled: boolean;
};

export function useDonationChat({
  donationId,
  accessToken,
  enabled,
}: UseDonationChatArgs) {
  const [messages, setMessages] = useState<DonationChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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

  const fetchHistory = useCallback(async (opts?: { before?: string }) => {
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
          setMessages([]);
          setNextCursor(null);
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
      if (opts?.before) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const merged = [...chunk.filter((m) => !seen.has(m.id)), ...prev];
          return merged.sort(sortMessages);
        });
      } else {
        setMessages(chunk.slice().sort(sortMessages));
      }
      setNextCursor(cursor);
    } catch (e) {
      /** GET /chat/.../messages returns 403 when the room is closed; axios rejects non-2xx so this never hits `status === 403` above. */
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        setRoomClosed(true);
        setRoomCloseReason(
          getApiMessageFromData(e.response.data) ?? "Chat is closed.",
        );
        if (!opts?.before) {
          setHistoryError(null);
          setMessages([]);
          setNextCursor(null);
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
  }, []);

  useEffect(() => {
    if (!enabled || !donationId || !accessToken) {
      setSocketConnected(false);
      return;
    }

    const base = config.apiUrl.replace(/\/$/, "");
    const socket = io(`${base}/chat`, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
    });
    socketRef.current = socket;

    const onMessage = (payload: unknown) => {
      const msg = parseDonationChatMessageRecord(payload);
      if (!msg) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msg.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...msg };
          return next.sort(sortMessages);
        }
        return [...prev, msg].sort(sortMessages);
      });
    };

    const onRoomClosed = (payload: unknown) => {
      if (!payload || typeof payload !== "object") {
        setRoomClosed(true);
        return;
      }
      const d = (payload as Record<string, unknown>).donationId;
      if (typeof d === "string" && d !== donationIdRef.current) return;
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
      const meta = parseSocketChatErrorMeta(payload);
      if (isChatClosedSocketMeta(meta)) {
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
        setRoomClosed(true);
        setRoomCloseReason("Chat is closed.");
        setSendError(null);
        setTypingLabel(null);
        return;
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

    socket.on("connect", () => {
      setSocketConnected(true);
      setSendError(null);
      const id = donationIdRef.current;
      if (id) socket.emit("chat:join", { donationId: id });
      void fetchHistory();
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
    });

    socket.on("chat:message", onMessage);
    socket.on("chat:room_closed", onRoomClosed);
    socket.on("chat:room_opened", onRoomOpened);
    socket.on("chat:error", onChatError);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:room_closed", onRoomClosed);
      socket.off("chat:room_opened", onRoomOpened);
      socket.off("chat:error", onChatError);
      socket.off("chat:typing", onTyping);
      const id = donationIdRef.current;
      if (id && socket.connected) socket.emit("chat:leave", { donationId: id });
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
    };
  }, [enabled, donationId, accessToken, fetchHistory]);

  useEffect(() => {
    if (!enabled || !donationId || !accessToken) {
      setMessages([]);
      setNextCursor(null);
      setHistoryError(null);
      setRoomClosed(false);
      setRoomCloseReason(null);
      setArrivedRecorded(false);
      setTypingLabel(null);
      setSendError(null);
    }
  }, [enabled, donationId, accessToken]);

  const sendText = useCallback(
    (text: string) => {
      const id = donationId;
      const s = socketRef.current;
      if (!id || !s?.connected || roomClosed) {
        return { ok: false as const, message: "Chat is not available." };
      }
      const trimmed = text.trim();
      if (!trimmed) {
        return { ok: false as const, message: "Message is empty." };
      }
      setSendBusy(true);
      setSendError(null);
      s.emit("chat:send", { donationId: id, text: trimmed });
      window.setTimeout(() => setSendBusy(false), 1500);
      return { ok: true as const };
    },
    [donationId, roomClosed],
  );

  const notifyTyping = useCallback(
    (typing: boolean) => {
      const id = donationId;
      const s = socketRef.current;
      if (!id || !s?.connected || roomClosed) return;
      s.emit("chat:typing", { donationId: id, typing });
    },
    [donationId, roomClosed],
  );

  const onComposerTyping = useCallback(() => {
    if (roomClosed) return;
    notifyTyping(true);
    if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
    typingEmitTimerRef.current = setTimeout(() => {
      notifyTyping(false);
      typingEmitTimerRef.current = null;
    }, 1200);
  }, [notifyTyping, roomClosed]);

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
