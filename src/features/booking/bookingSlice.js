// src/features/booking/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitBooking, validatePromoCode } from "./bookingApi";

export const submitBookingThunk = createAsyncThunk(
  "booking/submit",
  async (bookingData, { rejectWithValue }) => {
    try {
      console.log("SubmitBookingThunk - Starting booking process...");
      const response = await submitBooking(bookingData);
      console.log("SubmitBookingThunk - Booking successful:", response);

      // Ensure we return only serializable data
      const serializedResponse = JSON.parse(JSON.stringify(response));
      console.log("SubmitBookingThunk - Serialized response:", serializedResponse);

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
    clearBookingState: (state) => {
      state.status = "idle";
      state.error = null;
      state.redirectUrl = null;
      state.invoiceNumber = null;
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

        console.log("Extracted redirectUrl:", state.redirectUrl);
        console.log("Extracted invoiceNumber:", state.invoiceNumber);
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

export const { clearPromoValidation, clearBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
