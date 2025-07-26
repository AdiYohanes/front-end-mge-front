import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDayAvailability, fetchTimeAvailability } from "./availabilityApi";

export const fetchAvailabilityThunk = createAsyncThunk(
  "availability/fetchDayAvailability",
  async (params, { rejectWithValue }) => {
    // params = { unitId, startDate, endDate }
    try {
      const availabilityData = await fetchDayAvailability(params);
      return availabilityData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const fetchTimeSlotsThunk = createAsyncThunk(
  "availability/fetchTimeSlots",
  async (params, { rejectWithValue }) => {
    // params = { unitId, date }
    try {
      return await fetchTimeAvailability(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  bookedDates: {},
  timeSlots: [], // 2. Tambahkan state baru untuk time slots
  status: "idle",
  error: null,
};

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailabilityThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAvailabilityThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ubah array response menjadi object map untuk pencarian cepat
        const newBookedDates = {};
        action.payload.forEach((item) => {
          newBookedDates[item.date] = item.is_fully_booked;
        });
        state.bookedDates = newBookedDates;
      })
      .addCase(fetchAvailabilityThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchTimeSlotsThunk.pending, (state) => {
        state.status = "loading"; // Bisa tambahkan status loading spesifik jika perlu
      })
      .addCase(fetchTimeSlotsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.timeSlots = action.payload;
      })
      .addCase(fetchTimeSlotsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default availabilitySlice.reducer;
