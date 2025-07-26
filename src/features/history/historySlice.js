import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBookingHistory,
  fetchBookingDetail,
  cancelBooking,
  rescheduleBooking,
} from "./historyApi";

export const fetchHistoryThunk = createAsyncThunk(
  "history/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchBookingHistory();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch history"
      );
    }
  }
);
export const fetchDetailThunk = createAsyncThunk(
  "history/fetchDetail",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await fetchBookingDetail(bookingId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch details"
      );
    }
  }
);
export const cancelBookingThunk = createAsyncThunk(
  "history/cancelBooking",
  async (bookingId, { rejectWithValue, dispatch }) => {
    try {
      const response = await cancelBooking(bookingId);
      // Setelah berhasil cancel, panggil ulang data history agar daftar terupdate
      dispatch(fetchHistoryThunk());
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

export const rescheduleBookingThunk = createAsyncThunk(
  "history/rescheduleBooking",
  async ({ bookingId, rescheduleData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await rescheduleBooking(bookingId, rescheduleData);
      // Setelah berhasil reschedule, panggil ulang data history agar daftar terupdate
      dispatch(fetchHistoryThunk());
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reschedule booking"
      );
    }
  }
);

const initialState = {
  bookings: [],
  selectedBookingDetail: null, // State baru untuk menyimpan detail
  status: "idle", // Status general untuk list
  detailStatus: "idle", // Status spesifik untuk modal detail
  error: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBookingDetail = null;
      state.detailStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHistoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bookings = action.payload;
      })
      .addCase(fetchHistoryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDetailThunk.pending, (state) => {
        state.detailStatus = "loading";
      })
      .addCase(fetchDetailThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selectedBookingDetail = action.payload;
      })
      .addCase(fetchDetailThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload;
      })
      .addCase(cancelBookingThunk.pending, (state) => {
        state.detailStatus = "loading"; // Gunakan status detail untuk loading
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        action.payload; // Tidak perlu menyimpan payload, hanya trigger update
      })
      .addCase(cancelBookingThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload;
      })
      .addCase(rescheduleBookingThunk.pending, (state) => {
        state.detailStatus = "loading"; // Gunakan status detail untuk loading
      })
      .addCase(rescheduleBookingThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        action.payload; // Tidak perlu menyimpan payload, hanya trigger update
      })
      .addCase(rescheduleBookingThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload;
      });
  },
});
export const { clearSelectedBooking } = historySlice.actions;

export default historySlice.reducer;
