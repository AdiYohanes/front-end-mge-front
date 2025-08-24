// src/features/booking/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitBooking, validatePromoCode } from "./bookingApi";

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

export const validatePromoThunk = createAsyncThunk(
  "booking/validatePromo",
  async (promoName, { rejectWithValue }) => {
    try {
      const response = await validatePromoCode(promoName);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to validate promo code");
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  redirectUrl: null, // Untuk menyimpan snapUrl
  invoiceNumber: null,
  promoValidation: {
    status: "idle",
    error: null,
    promoData: null,
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearPromoValidation: (state) => {
      state.promoValidation = {
        status: "idle",
        error: null,
        promoData: null,
      };
    },
  },
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
        // Simpan invoice number bila tersedia dari berbagai kemungkinan field
        const p = action.payload || {};
        state.invoiceNumber =
          p.invoice_number ||
          p.invoiceNumber ||
          p.order_id ||
          p.orderId ||
          (p.data && (p.data.invoice_number || p.data.order_id)) ||
          null;
      })
      .addCase(submitBookingThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(validatePromoThunk.pending, (state) => {
        state.promoValidation.status = "loading";
        state.promoValidation.error = null;
      })
      .addCase(validatePromoThunk.fulfilled, (state, action) => {
        // Check if data array exists and has items
        if (action.payload.data && action.payload.data.length > 0) {
          state.promoValidation.status = "succeeded";
          state.promoValidation.promoData = action.payload.data[0];
          state.promoValidation.error = null;
        } else {
          // No promo codes found - treat as failed
          state.promoValidation.status = "failed";
          state.promoValidation.promoData = null;
          state.promoValidation.error = "Kode promo tidak lagi tersedia";
        }
      })
      .addCase(validatePromoThunk.rejected, (state, action) => {
        state.promoValidation.status = "failed";
        state.promoValidation.error = action.payload;
        state.promoValidation.promoData = null;
      });
  },
});

export const { clearPromoValidation } = bookingSlice.actions;
export default bookingSlice.reducer;
