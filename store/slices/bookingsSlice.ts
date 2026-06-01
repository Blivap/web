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
};

export type BookingsState = {
  sent: BookingListBranch;
  received: BookingListBranch;
};

const emptyBranch = (): BookingListBranch => ({
  items: [],
  status: "idle",
  error: null,
});

const initialState: BookingsState = {
  sent: emptyBranch(),
  received: emptyBranch(),
};

async function loadBookingsList(
  listFetcher: (params: BookingListQuery) => Promise<IResponse<unknown>>,
): Promise<Booking[]> {
  const listRes = await fetchAllBookingListPages((params) =>
    listFetcher(params),
  );

  if (!listRes.ok) {
    throw new Error(listRes.error);
  }

  return listRes.bookings;
}

/** Optional `silent` refetch keeps list on screen (no loading skeleton). */
type LoadBookingsArg = { silent?: boolean } | undefined;

export const loadSentBookings = createAsyncThunk(
  "bookings/loadSent",
  async (_arg: LoadBookingsArg, { rejectWithValue }) => {
    try {
      const bookings = await loadBookingsList((params) =>
        $api.bookings.sent(params),
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
  async (_arg: LoadBookingsArg, { rejectWithValue }) => {
    try {
      const bookings = await loadBookingsList((params) =>
        $api.bookings.received(params),
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSentBookings.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.sent.status = "loading";
        }
        state.sent.error = null;
      })
      .addCase(loadSentBookings.fulfilled, (state, action) => {
        state.sent.status = "ok";
        state.sent.items = action.meta.arg?.silent
          ? mergeBookingsList(state.sent.items, action.payload.bookings)
          : action.payload.bookings;
      })
      .addCase(loadSentBookings.rejected, (state, action) => {
        state.sent.status = "error";
        state.sent.error =
          (action.payload as string | undefined) ?? "Could not load bookings.";
        if (!action.meta.arg?.silent) {
          state.sent.items = [];
        }
      })
      .addCase(loadReceivedBookings.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.received.status = "loading";
        }
        state.received.error = null;
      })
      .addCase(loadReceivedBookings.fulfilled, (state, action) => {
        state.received.status = "ok";
        state.received.items = action.meta.arg?.silent
          ? mergeBookingsList(
              state.received.items,
              action.payload.bookings,
            )
          : action.payload.bookings;
      })
      .addCase(loadReceivedBookings.rejected, (state, action) => {
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

export const { patchBookingInLists } = bookingsSlice.actions;
export default bookingsSlice.reducer;
