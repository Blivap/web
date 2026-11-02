import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DonationChatMessage } from "@/types/donation-chat";
import {
  extractSocketChatPayloads,
  parseDonationChatMessageRecord,
} from "@/lib/chat/parseChatMessagesResponse";
import { logout } from "./authSlice";

function sortMessages(a: DonationChatMessage, b: DonationChatMessage): number {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

export type DonationChatRoomState = {
  messages: DonationChatMessage[];
  nextCursor: string | null;
};

export type DonationChatState = {
  rooms: Record<string, DonationChatRoomState>;
};

const initialState: DonationChatState = {
  rooms: {},
};

function getRoom(
  state: DonationChatState,
  donationId: string,
): DonationChatRoomState {
  if (!state.rooms[donationId]) {
    state.rooms[donationId] = { messages: [], nextCursor: null };
  }
  return state.rooms[donationId]!;
}

function mergeReadBy(
  a: string[] | undefined,
  b: string[] | undefined,
): string[] | undefined {
  if (!a?.length && !b?.length) return undefined;
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}

/** Keep local receipt flags if a racing history load returns stale rows. */
function withPreservedReceipts(
  existing: DonationChatMessage | undefined,
  incoming: DonationChatMessage,
): DonationChatMessage {
  if (!existing) return incoming;
  const readBy = mergeReadBy(existing.readBy, incoming.readBy);
  return {
    ...incoming,
    seen: Boolean(incoming.seen || existing.seen),
    seenByMe: Boolean(incoming.seenByMe || existing.seenByMe),
    ...(readBy?.length ? { readBy } : {}),
  };
}

function mergeOneMessageIntoList(
  list: DonationChatMessage[],
  msg: DonationChatMessage,
): DonationChatMessage[] {
  const withoutMatchingOptimistic = list.filter((m) => {
    if (!m.id.startsWith("opt-")) return true;
    const sameBody =
      m.text === msg.text &&
      (m.senderUserId === msg.senderUserId ||
        (!m.senderUserId && !msg.senderUserId));
    return !sameBody;
  });
  const idx = withoutMatchingOptimistic.findIndex((m) => m.id === msg.id);
  if (idx >= 0) {
    const next = [...withoutMatchingOptimistic];
    next[idx] = withPreservedReceipts(next[idx], msg);
    return next.sort(sortMessages);
  }
  return [...withoutMatchingOptimistic, msg].sort(sortMessages);
}

const donationChatSlice = createSlice({
  name: "donationChat",
  initialState,
  reducers: {
    resetDonationChatRoom: (
      state,
      action: PayloadAction<{ donationId: string }>,
    ) => {
      delete state.rooms[action.payload.donationId];
    },

    clearDonationChatMessages: (
      state,
      action: PayloadAction<{ donationId: string }>,
    ) => {
      const room = state.rooms[action.payload.donationId];
      if (room) {
        room.messages = [];
        room.nextCursor = null;
      }
    },

    mergeDonationChatHistory: (
      state,
      action: PayloadAction<{
        donationId: string;
        messages: DonationChatMessage[];
        nextCursor: string | null;
        prepend: boolean;
      }>,
    ) => {
      const {
        donationId,
        messages: chunk,
        nextCursor,
        prepend,
      } = action.payload;
      const room = getRoom(state, donationId);
      const previousById = new Map(room.messages.map((m) => [m.id, m]));
      const chunkWithReceipts = chunk.map((m) =>
        withPreservedReceipts(previousById.get(m.id), m),
      );
      if (prepend) {
        const seen = new Set(room.messages.map((m) => m.id));
        room.messages = [
          ...chunkWithReceipts.filter((m) => !seen.has(m.id)),
          ...room.messages,
        ].sort(sortMessages);
      } else {
        const optimistic = room.messages.filter((m) => m.id.startsWith("opt-"));
        if (optimistic.length === 0) {
          room.messages = chunkWithReceipts.slice().sort(sortMessages);
        } else {
          const seen = new Set(chunkWithReceipts.map((m) => m.id));
          const pending = optimistic.filter((m) => !seen.has(m.id));
          room.messages = [...chunkWithReceipts, ...pending].sort(sortMessages);
        }
      }
      room.nextCursor = nextCursor;
    },

    /** One or more socket frames (possibly nested / batched). */
    absorbSocketDonationChatPayload: (
      state,
      action: PayloadAction<{ donationId: string; payload: unknown }>,
    ) => {
      const { donationId, payload } = action.payload;
      const room = getRoom(state, donationId);
      const pieces = extractSocketChatPayloads(payload);
      let list = room.messages;
      for (const piece of pieces) {
        const msg = parseDonationChatMessageRecord(piece);
        if (!msg) continue;
        list = mergeOneMessageIntoList(list, msg);
      }
      room.messages = list;
    },

    appendDonationChatOptimistic: (
      state,
      action: PayloadAction<{
        donationId: string;
        message: DonationChatMessage;
      }>,
    ) => {
      const { donationId, message } = action.payload;
      const room = getRoom(state, donationId);
      room.messages = [...room.messages, message].sort(sortMessages);
    },

    stripDonationChatOptimistic: (
      state,
      action: PayloadAction<{
        donationId: string;
        /** Remove a single optimistic row by id (e.g. send error rollback). */
        id?: string;
        /** Remove every `opt-…` row for this room. */
        all?: boolean;
      }>,
    ) => {
      const { donationId, id, all } = action.payload;
      const room = state.rooms[donationId];
      if (!room) return;
      if (typeof id === "string" && id.length > 0) {
        room.messages = room.messages.filter((m) => m.id !== id);
        return;
      }
      if (all) {
        room.messages = room.messages.filter((m) => !m.id.startsWith("opt-"));
      }
    },

    /**
     * Apply `chat:seen` / `chat:read` from the gateway.
     * `seenByUserId === viewerUserId` → those peer messages are seenByMe.
     * Otherwise the peer read our messages → `seen`.
     */
    markDonationChatMessagesSeen: (
      state,
      action: PayloadAction<{
        donationId: string;
        messageIds: string[];
        seenByUserId: string;
        viewerUserId: string;
      }>,
    ) => {
      const { donationId, messageIds, seenByUserId, viewerUserId } =
        action.payload;
      const room = state.rooms[donationId];
      if (!room || messageIds.length === 0) return;
      const idSet = new Set(messageIds);
      const viewer = viewerUserId.trim();
      const reader = seenByUserId.trim();
      if (!viewer || !reader) return;
      const iRead = reader === viewer;

      room.messages = room.messages.map((m) => {
        if (!idSet.has(m.id)) return m;
        const readBy = Array.isArray(m.readBy) ? [...m.readBy] : [];
        if (!readBy.includes(reader)) readBy.push(reader);
        if (iRead) {
          return { ...m, readBy, seenByMe: true };
        }
        const mine =
          Boolean(m.senderUserId) && m.senderUserId === viewer;
        if (!mine) return { ...m, readBy };
        return { ...m, readBy, seen: true };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => ({ ...initialState }));
  },
});

export const {
  resetDonationChatRoom,
  clearDonationChatMessages,
  mergeDonationChatHistory,
  absorbSocketDonationChatPayload,
  appendDonationChatOptimistic,
  stripDonationChatOptimistic,
  markDonationChatMessagesSeen,
} = donationChatSlice.actions;

export default donationChatSlice.reducer;
