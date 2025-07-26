import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchRooms } from "./roomsApi";

export const fetchRoomsThunk = createAsyncThunk(
  "rooms/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      // Kita hanya akan menampilkan ruangan yang is_available
      const roomsData = await fetchRooms();
      return roomsData.filter((room) => room.is_available);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  rooms: [],
  status: "idle",
  error: null,
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRoomsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rooms = action.payload;
      })
      .addCase(fetchRoomsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default roomsSlice.reducer;
