// src/features/booking/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitBooking, validatePromoCode } from "./bookingApi";

export const submitBookingThunk = createAsyncThunk(
  "booking/submit",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await submitBooking(bookingData);

      // Ensure we return only serializable data
      const serializedResponse = JSON.parse(JSON.stringify(response));

      return serializedResponse;
    } catch (error) {
      console.error("SubmitBookingThunk - Booking failed:", error);

      // Extract detailed error message
      let errorMessage = "Booking failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add status code context if available
      if (error.response?.status) {
        errorMessage = `${errorMessage} (Status: ${error.response.status})`;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const validatePromoThunk = createAsyncThunk(
  "booking/validatePromo",
  async (promoCode, { rejectWithValue }) => {
    try {
      const response = await validatePromoCode(promoCode);
      return response;
    } catch (error) {
      console.error("ValidatePromoThunk - Error:", error); // Debug log
      const errorMessage = error.response?.data?.message || error.message || "Failed to validate promo code";
      console.error("ValidatePromoThunk - Error message:", errorMessage); // Debug log
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  redirectUrl: null, // Untuk menyimpan snapUrl
  invoiceNumber: null,
  bookingData: null, // Untuk menyimpan booking data seperti di fnbsSlice
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
    clearBookingState: (state) => {
      state.status = "idle";
      state.error = null;
      state.redirectUrl = null;
      state.invoiceNumber = null;
      state.bookingData = null;
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

        // Ensure payload is serializable - extract only the data we need
        const payload = action.payload || {};
        console.log("Booking fulfilled payload:", payload);

        // Store the full booking data (similar to fnbsSlice)
        state.bookingData = payload;

        // Extract snapUrl safely
        state.redirectUrl = payload.snapUrl || payload.snap_url || null;

        // Extract invoice number safely from various possible locations
        state.invoiceNumber =
          payload.invoice_number ||
          payload.invoiceNumber ||
          payload.order_id ||
          payload.orderId ||
          (payload.data && typeof payload.data === 'object' ?
            (payload.data.invoice_number || payload.data.order_id) : null) ||
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
          // Prefer exact match on promo_code if multiple entries are returned
          const list = action.payload.data;
          const exact = Array.isArray(list) ? list.find(p => p && p.promo_code && typeof p.promo_code === 'string') : null;
          state.promoValidation.promoData = exact || list[0];
          state.promoValidation.error = null;
        } else {
          // No promo codes found - treat as failed
          state.promoValidation.status = "failed";
          state.promoValidation.promoData = null;
          state.promoValidation.error = "Promo yang Anda masukan tidak ditemukan";
        }
      })
      .addCase(validatePromoThunk.rejected, (state, action) => {
        console.error("ValidatePromoThunk rejected - Error:", action.payload); // Debug log
        state.promoValidation.status = "failed";
        state.promoValidation.error = action.payload;
        state.promoValidation.promoData = null;
      });
  },
});

export const { clearPromoValidation, clearBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
