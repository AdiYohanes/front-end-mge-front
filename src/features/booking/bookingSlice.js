// src/features/booking/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitBooking } from "./bookingApi";

export const submitBookingThunk = createAsyncThunk(
  "booking/submit",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await submitBooking(bookingData);
      return response; // Kirim seluruh response (termasuk snapUrl)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Booking failed");
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  redirectUrl: null, // Untuk menyimpan snapUrl
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitBookingThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.redirectUrl = null;
      })
      .addCase(submitBookingThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.redirectUrl = action.payload.snapUrl; // Simpan snapUrl ke state
      })
      .addCase(submitBookingThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default bookingSlice.reducer;
