import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchConsoles } from "./consolesApi";

export const fetchConsolesThunk = createAsyncThunk(
  "consoles/fetchConsoles",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchConsoles();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  consoles: [],
  status: "idle",
  error: null,
};

const consolesSlice = createSlice({
  name: "consoles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsolesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConsolesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.consoles = action.payload;
      })
      .addCase(fetchConsolesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default consolesSlice.reducer;
