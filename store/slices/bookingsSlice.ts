import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { $api } from "@/app/api";
import { fetchAllBookingListPages } from "@/lib/bookings/fetchAllBookingListPages";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import type { IResponse } from "@/types";
import type { Booking, BookingListQuery } from "@/types/bookings";
import { mergeBookingsList } from "@/lib/bookings/mergeBookingsList";
import { logout } from "./authSlice";

export type BookingListLoadState = "idle" | "loading" | "ok" | "error";

type BookingListBranch = {
  items: Booking[];
  status: BookingListLoadState;
  error: string | null;
  /** Latest dispatched load. Older responses are ignored. */
  requestId: string | null;
};

export type BookingsState = {
  sent: BookingListBranch;
  received: BookingListBranch;
};

const emptyBranch = (): BookingListBranch => ({
  items: [],
  status: "idle",
  error: null,
  requestId: null,
});

const initialState: BookingsState = {
  sent: emptyBranch(),
  received: emptyBranch(),
};

async function loadBookingsList(
  listFetcher: (params: BookingListQuery) => Promise<IResponse<unknown>>,
  query?: Pick<BookingListQuery, "filter" | "date">,
): Promise<Booking[]> {
  const listRes = await fetchAllBookingListPages(
    (params) => listFetcher(params),
    query,
  );

  if (!listRes.ok) {
    throw new Error(listRes.error);
  }

  return listRes.bookings;
}

/** Optional `silent` refetch keeps list on screen (no loading skeleton). */
export type LoadBookingsArg =
  | {
      silent?: boolean;
      /** Replace stored rows instead of merging. Use when a server filter is active. */
      replace?: boolean;
      query?: Pick<BookingListQuery, "filter" | "date">;
    }
  | undefined;

export const loadSentBookings = createAsyncThunk(
  "bookings/loadSent",
  async (arg: LoadBookingsArg, { rejectWithValue }) => {
    try {
      const bookings = await loadBookingsList(
        (params) => $api.bookings.list(params),
        arg?.query,
      );
      return { bookings };
    } catch (e) {
      const msg =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : getAxiosErrorMessage(e, "Could not load bookings.");
      return rejectWithValue(msg);
    }
  },
);

export const loadReceivedBookings = createAsyncThunk(
  "bookings/loadReceived",
  async (arg: LoadBookingsArg, { rejectWithValue }) => {
    try {
      const bookings = await loadBookingsList(
        (params) => $api.bookings.list(params),
        arg?.query,
      );
      return { bookings };
    } catch (e) {
      const msg =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : getAxiosErrorMessage(e, "Could not load bookings.");
      return rejectWithValue(msg);
    }
  },
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    /**
     * Merges fields into a booking in both sent and received lists (if present).
     * Rebuilds the `items` array so subscribers always see a new reference.
     */
    patchBookingInLists: (
      state,
      action: PayloadAction<
        { id: string } & Partial<
          Pick<
            Booking,
            | "status"
            | "respondedAt"
            | "meetingCode"
            | "slotEndAt"
            | "reportsCount"
            | "requesterHasRated"
          >
        >
      >,
    ) => {
      const { id, ...patch } = action.payload;
      if (Object.keys(patch).length === 0) return;

      for (const branch of ["sent", "received"] as const) {
        const items = state[branch].items;
        const idx = items.findIndex((b) => b.id === id);
        if (idx === -1) continue;
        const row = items[idx];
        const merged = { ...row, ...patch };
        state[branch].items = [
          ...items.slice(0, idx),
          merged,
          ...items.slice(idx + 1),
        ];
      }
    },
    /** Inserts a booking returned by create (or replaces the same id). */
    upsertBookingInLists: (
      state,
      action: PayloadAction<{
        branch: "sent" | "received";
        booking: Booking;
      }>,
    ) => {
      const { branch, booking } = action.payload;
      const items = state[branch].items;
      const idx = items.findIndex((row) => row.id === booking.id);
      state[branch].items =
        idx === -1
          ? [booking, ...items]
          : [
              ...items.slice(0, idx),
              { ...items[idx], ...booking },
              ...items.slice(idx + 1),
            ];
      if (state[branch].status === "idle") state[branch].status = "ok";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSentBookings.pending, (state, action) => {
        state.sent.requestId = action.meta.requestId;
        if (!action.meta.arg?.silent) {
          state.sent.status = "loading";
          state.sent.error = null;
        }
      })
      .addCase(loadSentBookings.fulfilled, (state, action) => {
        if (state.sent.requestId !== action.meta.requestId) return;
        state.sent.status = "ok";
        state.sent.error = null;
        const replace = !action.meta.arg?.silent || action.meta.arg?.replace;
        state.sent.items = replace
          ? action.payload.bookings
          : mergeBookingsList(state.sent.items, action.payload.bookings);
      })
      .addCase(loadSentBookings.rejected, (state, action) => {
        if (state.sent.requestId !== action.meta.requestId) return;
        state.sent.status = "error";
        state.sent.error =
          (action.payload as string | undefined) ?? "Could not load bookings.";
        if (!action.meta.arg?.silent) {
          state.sent.items = [];
        }
      })
      .addCase(loadReceivedBookings.pending, (state, action) => {
        state.received.requestId = action.meta.requestId;
        if (!action.meta.arg?.silent) {
          state.received.status = "loading";
          state.received.error = null;
        }
      })
      .addCase(loadReceivedBookings.fulfilled, (state, action) => {
        if (state.received.requestId !== action.meta.requestId) return;
        state.received.status = "ok";
        state.received.error = null;
        const replace =
          !action.meta.arg?.silent || action.meta.arg?.replace;
        state.received.items = replace
          ? action.payload.bookings
          : mergeBookingsList(state.received.items, action.payload.bookings);
      })
      .addCase(loadReceivedBookings.rejected, (state, action) => {
        if (state.received.requestId !== action.meta.requestId) return;
        state.received.status = "error";
        state.received.error =
          (action.payload as string | undefined) ?? "Could not load bookings.";
        if (!action.meta.arg?.silent) {
          state.received.items = [];
        }
      })
      .addCase(logout, () => ({ ...initialState }));
  },
});

export const { patchBookingInLists, upsertBookingInLists } =
  bookingsSlice.actions;
export default bookingsSlice.reducer;
