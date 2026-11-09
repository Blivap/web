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
  type SupportResponseType,
} from "@/lib/support/bliiva";
import { SUPPORT_MESSAGE_MAX } from "@/lib/support/supportChat";

export type SupportThreadLine = {
  id: string;
  from: SupportChatMessage["senderType"];
  text: string;
};

const PAGE_LIMIT = 20;

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
  const [hasEarlier, setHasEarlier] = useState(false);
  const [hasThread, setHasThread] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  const previousUserRef = useRef<string | undefined>(undefined);
  const statusRef = useRef<string | null>(null);
  const pageRef = useRef(1);
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

  useEffect(() => {
    const previous = previousUserRef.current;
    previousUserRef.current = userId;
    if (previous == null || previous === userId) return;
    hydratedFor.current = null;
    conversationIdRef.current = null;
    statusRef.current = null;
    pageRef.current = 1;
    setLines([]);
    setDraft("");
    setError(null);
    setResponseType(null);
    setChoices([]);
    setReference(null);
    setBranchMessageId(null);
    setConversationStatus(null);
    setHasEarlier(false);
    setHasThread(false);
  }, [userId]);

  useEffect(() => {
    if (!open || !userId || hydratedFor.current === userId) return;
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
        const [conversation, page] = await Promise.all([
          $api.support.conversation(storedId),
          $api.support.messages(storedId, { page: 1, limit: PAGE_LIMIT }),
        ]);
        if (cancelled) return;
        hydratedFor.current = userId;
        conversationIdRef.current = conversation.id;
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
        const last = page.messages[page.messages.length - 1];
        setBranchMessageId(last && last.senderType !== "user" ? last.id : null);
      } catch (error) {
        if (cancelled || isUnauthorized(error)) return;
        if (isMissingConversation(error)) {
          clearStoredId(userId);
          conversationIdRef.current = null;
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
  }, [applyConversation, open, userId]);

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
          conversationIdRef.current = id;
          statusRef.current = created.status;
          setConversationStatus(created.status);
          writeStoredId(userId, id);
          setHasThread(true);
        }

        const turn = await $api.support.sendMessage(id, text);
        conversationIdRef.current = turn.conversationId || id;
        writeStoredId(userId, conversationIdRef.current);
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
    [userId],
  );

  const startNew = useCallback(() => {
    if (!userId || sendingRef.current) return;
    clearStoredId(userId);
    conversationIdRef.current = null;
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
  }, [userId]);

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
    hasEarlier,
    hasThread,
    statusLabel: supportStatusLabel(responseType, conversationStatus),
    send,
    retry,
    startNew,
    loadEarlier,
  };
}
