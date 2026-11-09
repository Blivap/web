import axios from "axios";
import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  chronologicalMessages,
  parseSupportConversation,
  parseSupportMessages,
  parseSupportTurn,
  readBliivaData,
  type BliivaPageMeta,
  type SupportChatMessage,
  type SupportConversation,
  type SupportTurn,
} from "@/lib/support/bliiva";

export class SupportChatError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SupportChatError";
    this.status = status;
  }
}

const MESSAGE_PAGE_LIMIT = 20;

async function readEnvelope<T>(
  run: () => Promise<{ status: number; data?: unknown; error?: string | null }>,
  parse: (data: unknown) => T | null,
  fallback: string,
): Promise<{ data: T; meta: BliivaPageMeta | null }> {
  try {
    const res = await run();
    if (res.status === 0 || res.error) {
      throw new SupportChatError(
        res.error || "Support chat is temporarily unavailable.",
        0,
      );
    }
    const read = readBliivaData(res.data, parse);
    if (!read.ok) throw new SupportChatError(read.message, res.status);
    return { data: read.value.data, meta: read.value.meta };
  } catch (error) {
    if (error instanceof SupportChatError) throw error;
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new SupportChatError(
        getAxiosErrorMessage(error, fallback),
        error.response?.status ?? 0,
      );
    }
    throw new SupportChatError(fallback, 0);
  }
}

export default function SupportRepository() {
  return {
    /** POST /support/conversations → Bliiva envelope, 201. */
    createConversation(): Promise<SupportConversation> {
      return readEnvelope(
        () =>
          fetcher(endpoints.support.conversations, {
            method: "POST",
            data: {},
          }),
        parseSupportConversation,
        "Bliiva could not start a conversation.",
      ).then((result) => result.data);
    },

    /** GET /support/conversations/:id → Bliiva envelope, 200. */
    conversation(id: string): Promise<SupportConversation> {
      return readEnvelope(
        () => fetcher(endpoints.support.conversation(id), { method: "GET" }),
        parseSupportConversation,
        "Bliiva could not open that conversation.",
      ).then((result) => result.data);
    },

    /**
     * GET /support/conversations/:id/messages → Bliiva envelope.
     * `data` is the message array. `meta` is present on this list.
     * Messages are returned oldest-first for display.
     */
    async messages(
      id: string,
      params?: { page?: number; limit?: number },
    ): Promise<{
      messages: SupportChatMessage[];
      meta: BliivaPageMeta | null;
    }> {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? MESSAGE_PAGE_LIMIT;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const result = await readEnvelope(
        () =>
          fetcher(`${endpoints.support.messages(id)}?${query.toString()}`, {
            method: "GET",
          }),
        parseSupportMessages,
        "Bliiva could not load messages.",
      );
      return {
        messages: chronologicalMessages(result.data),
        meta: result.meta,
      };
    },

    /** POST /support/conversations/:id/messages → Bliiva envelope, 201. */
    sendMessage(id: string, content: string): Promise<SupportTurn> {
      return readEnvelope(
        () =>
          fetcher(endpoints.support.messages(id), {
            method: "POST",
            data: { content },
          }),
        parseSupportTurn,
        "Bliiva could not send that message.",
      ).then((result) => result.data);
    },
  };
}
