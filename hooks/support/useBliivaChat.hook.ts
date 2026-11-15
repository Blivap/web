"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { $api } from "@/app/api";
import { SupportChatError } from "@/app/api/supportRepository";
import {
  choicesForResponse,
  inferResponseType,
  supportStatusLabel,
  type SupportChatMessage,
  type SupportConversation,
  type SupportResponseType,
} from "@/lib/support/bliiva";
import { SUPPORT_MESSAGE_MAX } from "@/lib/support/supportChat";

export type SupportThreadLine = {
  id: string;
  from: SupportChatMessage["senderType"];
  text: string;
};

const PAGE_LIMIT = 20;
const HISTORY_LIMIT = 20;

function storageKey(userId: string) {
  return `blivap.bliiva.conversation.${userId}`;
}

function readStoredId(userId: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

function writeStoredId(userId: string, id: string) {
  try {
    sessionStorage.setItem(storageKey(userId), id);
  } catch {
    /* private mode can block storage; the open thread still works */
  }
}

function clearStoredId(userId: string) {
  try {
    sessionStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}

function localId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}`;
}

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function errorText(error: unknown, fallback: string) {
  if (error instanceof SupportChatError) return error.message;
  if (axios.isAxiosError(error)) return fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function isMissingConversation(error: unknown) {
  return error instanceof SupportChatError && error.status === 404;
}

export function useBliivaChat(userId: string | undefined, open: boolean) {
  const [lines, setLines] = useState<SupportThreadLine[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<SupportResponseType | null>(
    null,
  );
  const [choices, setChoices] = useState<string[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const [branchMessageId, setBranchMessageId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string | null>(
    null,
  );
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasEarlier, setHasEarlier] = useState(false);
  const [hasThread, setHasThread] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SupportConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  const previousUserRef = useRef<string | undefined>(undefined);
  const statusRef = useRef<string | null>(null);
  const pageRef = useRef(1);
  const historyPageRef = useRef(1);
  const sendingRef = useRef(false);
  const lastSentRef = useRef("");
  const hydratedFor = useRef<string | null>(null);

  const applyConversation = useCallback(
    (
      status: string,
      pendingOptions: string[],
      type: SupportResponseType | null,
    ) => {
      statusRef.current = status;
      setConversationStatus(status);
      setResponseType(type);
      setChoices(
        choicesForResponse(type, { question: "", options: pendingOptions }),
      );
    },
    [],
  );

  const rememberConversation = useCallback(
    (id: string | null) => {
      conversationIdRef.current = id;
      setConversationId(id);
      if (!userId) return;
      if (id) writeStoredId(userId, id);
      else clearStoredId(userId);
    },
    [userId],
  );

  const hydrateThread = useCallback(
    async (id: string) => {
      const [conversation, page] = await Promise.all([
        $api.support.conversation(id),
        $api.support.messages(id, { page: 1, limit: PAGE_LIMIT }),
      ]);
      rememberConversation(conversation.id);
      pageRef.current = page.meta?.page ?? 1;
      const type = inferResponseType(conversation);
      applyConversation(
        conversation.status,
        conversation.pendingClarification?.options ?? [],
        type,
      );
      setLines(
        page.messages.map((message) => ({
          id: message.id,
          from: message.senderType,
          text: message.content,
        })),
      );
      setHasEarlier((page.meta?.page ?? 1) < (page.meta?.totalPages ?? 1));
      setHasThread(true);
      setReference(null);
      const last = page.messages[page.messages.length - 1];
      setBranchMessageId(last && last.senderType !== "user" ? last.id : null);
    },
    [applyConversation, rememberConversation],
  );

  useEffect(() => {
    const previous = previousUserRef.current;
    previousUserRef.current = userId;
    if (previous == null || previous === userId) return;
    hydratedFor.current = null;
    conversationIdRef.current = null;
    statusRef.current = null;
    pageRef.current = 1;
    historyPageRef.current = 1;
    setLines([]);
    setDraft("");
    setError(null);
    setResponseType(null);
    setChoices([]);
    setReference(null);
    setBranchMessageId(null);
    setConversationStatus(null);
    setConversationId(null);
    setHasEarlier(false);
    setHasThread(false);
    setHistoryOpen(false);
    setHistory([]);
    setHistoryHasMore(false);
  }, [userId]);

  useEffect(() => {
    if (!open) {
      setHistoryOpen(false);
      return;
    }
    if (!userId || hydratedFor.current === userId) return;
    const storedId = readStoredId(userId);
    if (!storedId) {
      hydratedFor.current = userId;
      return;
    }
    setHasThread(true);

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        await hydrateThread(storedId);
        if (cancelled) return;
        hydratedFor.current = userId;
      } catch (error) {
        if (cancelled || isUnauthorized(error)) return;
        if (isMissingConversation(error)) {
          rememberConversation(null);
          hydratedFor.current = userId;
          setHasThread(false);
          return;
        }
        setError(errorText(error, "Bliiva could not open this conversation."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateThread, open, rememberConversation, userId]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sendingRef.current) return;
      if (!userId) {
        setError("Sign in to message Bliiva.");
        return;
      }
      if (text.length > SUPPORT_MESSAGE_MAX) {
        setError("Keep the message under 2,000 characters.");
        return;
      }

      sendingRef.current = true;
      setSending(true);
      setHistoryOpen(false);
      setError(null);
      setDraft("");
      setChoices([]);
      const optimisticId = localId();
      const closed =
        statusRef.current === "closed" || statusRef.current === "resolved";
      setLines((current) =>
        closed
          ? [{ id: optimisticId, from: "user", text }]
          : [...current, { id: optimisticId, from: "user", text }],
      );

      try {
        let id = conversationIdRef.current;
        if (!id || closed) {
          const created = await $api.support.createConversation();
          id = created.id;
          rememberConversation(id);
          statusRef.current = created.status;
          setConversationStatus(created.status);
          setHasThread(true);
        }

        const turn = await $api.support.sendMessage(id, text);
        rememberConversation(turn.conversationId || id);
        lastSentRef.current = text;
        statusRef.current = turn.state.status;
        setConversationStatus(turn.state.status);
        setResponseType(turn.responseType);
        setReference(turn.reference);
        setChoices(
          choicesForResponse(
            turn.responseType,
            turn.state.pendingClarification,
          ),
        );
        setBranchMessageId(turn.message.id);
        setLines((current) => [
          ...current,
          {
            id: turn.message.id,
            from: turn.message.senderType,
            text: turn.message.content,
          },
        ]);
      } catch (error) {
        if (!isUnauthorized(error)) {
          setLines((current) =>
            current.filter((line) => line.id !== optimisticId),
          );
          setDraft(text);
          setError(errorText(error, "Bliiva could not send that message."));
        }
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [rememberConversation, userId],
  );

  const startNew = useCallback(() => {
    if (!userId || sendingRef.current) return;
    rememberConversation(null);
    statusRef.current = null;
    pageRef.current = 1;
    lastSentRef.current = "";
    hydratedFor.current = userId;
    setLines([]);
    setError(null);
    setResponseType(null);
    setChoices([]);
    setReference(null);
    setBranchMessageId(null);
    setConversationStatus(null);
    setHasEarlier(false);
    setHasThread(false);
    setHistoryOpen(false);
  }, [rememberConversation, userId]);

  const openHistory = useCallback(async () => {
    if (!userId || historyLoading) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    setError(null);
    try {
      const page = await $api.support.conversations({
        page: 1,
        limit: HISTORY_LIMIT,
      });
      historyPageRef.current = page.meta?.page ?? 1;
      setHistory(page.conversations);
      setHistoryHasMore((page.meta?.page ?? 1) < (page.meta?.totalPages ?? 1));
    } catch (error) {
      if (!isUnauthorized(error)) {
        const message = errorText(error, "Bliiva could not load your chats.");
        setError(
          /cannot get \/api\/v1\/support\/conversations/i.test(message)
            ? "Previous chats are unavailable until support is restarted."
            : message,
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [historyLoading, userId]);

  const loadMoreHistory = useCallback(async () => {
    if (!userId || !historyHasMore || historyLoading) return;
    const nextPage = historyPageRef.current + 1;
    setHistoryLoading(true);
    setError(null);
    try {
      const page = await $api.support.conversations({
        page: nextPage,
        limit: HISTORY_LIMIT,
      });
      historyPageRef.current = page.meta?.page ?? nextPage;
      setHistory((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [
          ...current,
          ...page.conversations.filter((item) => !seen.has(item.id)),
        ];
      });
      setHistoryHasMore(
        (page.meta?.page ?? nextPage) < (page.meta?.totalPages ?? 1),
      );
    } catch (error) {
      if (!isUnauthorized(error)) {
        setError(errorText(error, "Bliiva could not load more chats."));
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [historyHasMore, historyLoading, userId]);

  const openConversation = useCallback(
    async (id: string, status?: string) => {
      if (!userId || sendingRef.current || loading) return;
      if (status === "closed" || status === "resolved") {
        setError("That chat is closed. Start a new chat instead.");
        return;
      }
      if (id === conversationIdRef.current && hasThread) {
        setHistoryOpen(false);
        return;
      }
      setHistoryOpen(false);
      setLoading(true);
      setError(null);
      try {
        await hydrateThread(id);
        hydratedFor.current = userId;
      } catch (error) {
        if (!isUnauthorized(error)) {
          const message = errorText(
            error,
            "Bliiva could not open that conversation.",
          );
          setError(
            /cannot get \/api\/v1\/support\/conversations/i.test(message)
              ? "Previous chats are unavailable until support is restarted."
              : message,
          );
          setHistoryOpen(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [hasThread, hydrateThread, loading, userId],
  );

  const retry = useCallback(() => {
    const text = lastSentRef.current;
    if (!text) return;
    void send(text);
  }, [send]);

  const loadEarlier = useCallback(async () => {
    const id = conversationIdRef.current;
    if (!id || !hasEarlier || loadingEarlier) return false;
    const nextPage = pageRef.current + 1;
    setLoadingEarlier(true);
    setError(null);
    try {
      const page = await $api.support.messages(id, {
        page: nextPage,
        limit: PAGE_LIMIT,
      });
      pageRef.current = page.meta?.page ?? nextPage;
      setHasEarlier(
        (page.meta?.page ?? nextPage) < (page.meta?.totalPages ?? 1),
      );
      setLines((current) => {
        const seen = new Set(current.map((line) => line.id));
        const older = page.messages
          .filter((message) => !seen.has(message.id))
          .map((message) => ({
            id: message.id,
            from: message.senderType,
            text: message.content,
          }));
        return [...older, ...current];
      });
      return true;
    } catch (error) {
      if (!isUnauthorized(error)) {
        setError(errorText(error, "Bliiva could not load earlier messages."));
      }
      return false;
    } finally {
      setLoadingEarlier(false);
    }
  }, [hasEarlier, loadingEarlier]);

  return {
    lines,
    draft,
    setDraft,
    sending,
    loading,
    loadingEarlier,
    error,
    responseType,
    choices,
    reference,
    branchMessageId,
    conversationId,
    hasEarlier,
    hasThread,
    historyOpen,
    history,
    historyLoading,
    historyHasMore,
    statusLabel: supportStatusLabel(responseType, conversationStatus),
    send,
    retry,
    startNew,
    openHistory,
    closeHistory: () => setHistoryOpen(false),
    loadMoreHistory,
    openConversation,
    loadEarlier,
  };
}
