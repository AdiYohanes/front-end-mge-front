import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchFnbs, fetchFnbsCategories, bookFnbs } from "./fnbsApi";

// Fetch F&B items
export const fetchFnbsThunk = createAsyncThunk(
  "fnbs/fetchFnbs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchFnbs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch F&B items");
    }
  }
);

// Fetch F&B categories
export const fetchFnbsCategoriesThunk = createAsyncThunk(
  "fnbs/fetchFnbsCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchFnbsCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch F&B categories");
    }
  }
);

// Book F&B items
export const bookFnbsThunk = createAsyncThunk(
  "fnbs/bookFnbs",
  async (fnbData, { rejectWithValue }) => {
    try {
      const response = await bookFnbs(fnbData);
      return response;
    } catch (error) {
      console.error("F&B booking error in thunk:", error);
      return rejectWithValue(error.response?.data || error.message || "Failed to book F&B items");
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  selectedCategory: "all",
  status: "idle",
  error: null,
  bookingStatus: "idle",
  bookingError: null,
  bookingData: null,
};

const fnbsSlice = createSlice({
  name: "fnbs",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    resetBookingStatus: (state) => {
      state.bookingStatus = "idle";
      state.bookingError = null;
      state.bookingData = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch F&B items
    builder
      .addCase(fetchFnbsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFnbsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFnbsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Fetch F&B categories
    builder
      .addCase(fetchFnbsCategoriesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFnbsCategoriesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchFnbsCategoriesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Book F&B items
    builder
      .addCase(bookFnbsThunk.pending, (state) => {
        state.bookingStatus = "loading";
        state.bookingError = null;
      })
      .addCase(bookFnbsThunk.fulfilled, (state, action) => {
        state.bookingStatus = "succeeded";
        state.bookingData = action.payload;
      })
      .addCase(bookFnbsThunk.rejected, (state, action) => {
        state.bookingStatus = "failed";
        state.bookingError = action.payload;
      });
  },
});

export const { setSelectedCategory, resetBookingStatus } = fnbsSlice.actions;
export default fnbsSlice.reducer;
