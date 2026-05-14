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
    next[idx] = { ...next[idx], ...msg };
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
      const { donationId, messages: chunk, nextCursor, prepend } =
        action.payload;
      const room = getRoom(state, donationId);
      if (prepend) {
        const seen = new Set(room.messages.map((m) => m.id));
        room.messages = [
          ...chunk.filter((m) => !seen.has(m.id)),
          ...room.messages,
        ].sort(sortMessages);
      } else {
        const optimistic = room.messages.filter((m) => m.id.startsWith("opt-"));
        if (optimistic.length === 0) {
          room.messages = chunk.slice().sort(sortMessages);
        } else {
          const seen = new Set(chunk.map((m) => m.id));
          const pending = optimistic.filter((m) => !seen.has(m.id));
          room.messages = [...chunk, ...pending].sort(sortMessages);
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
      action: PayloadAction<{ donationId: string; message: DonationChatMessage }>,
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
} = donationChatSlice.actions;

export default donationChatSlice.reducer;
