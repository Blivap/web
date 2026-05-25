import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { $api } from "@/app/api";
import { fetchAllBookingListPages } from "@/lib/bookings/fetchAllBookingListPages";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
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
  hospitalNamesById: Record<string, string>;
};

const emptyBranch = (): BookingListBranch => ({
  items: [],
  status: "idle",
  error: null,
});

const initialState: BookingsState = {
  sent: emptyBranch(),
  received: emptyBranch(),
  hospitalNamesById: {},
};

async function loadBookingsWithHospitals(
  listFetcher: (params: BookingListQuery) => Promise<IResponse<unknown>>,
): Promise<{
  bookings: Booking[];
  hospitalNamesById: Record<string, string>;
}> {
  const [listRes, hospRes] = await Promise.all([
    fetchAllBookingListPages((params) => listFetcher(params)),
    $api.hospitals.list(),
  ]);

  if (!listRes.ok) {
    throw new Error(listRes.error);
  }

  const hospitalNamesById: Record<string, string> = {};
  if (
    hospRes.status >= 200 &&
    hospRes.status < 300 &&
    hospRes.data !== undefined
  ) {
    const hospitals = parseHospitalsListResponse(hospRes.data);
    for (const h of hospitals) hospitalNamesById[h.id] = h.name;
  }

  return { bookings: listRes.bookings, hospitalNamesById };
}

/** Optional `silent` refetch keeps list on screen (no loading skeleton). */
type LoadBookingsArg = { silent?: boolean } | undefined;

export const loadSentBookings = createAsyncThunk(
  "bookings/loadSent",
  async (_arg: LoadBookingsArg, { rejectWithValue }) => {
    try {
      return await loadBookingsWithHospitals((params) =>
        $api.bookings.sent(params),
      );
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
      return await loadBookingsWithHospitals((params) =>
        $api.bookings.received(params),
      );
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
        state.hospitalNamesById = {
          ...state.hospitalNamesById,
          ...action.payload.hospitalNamesById,
        };
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
        state.hospitalNamesById = {
          ...state.hospitalNamesById,
          ...action.payload.hospitalNamesById,
        };
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
