// src/features/games/gamesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchGames } from "./gamesApi";

// Buat Async Thunk untuk mengambil data game
export const fetchGamesThunk = createAsyncThunk(
  "games/fetchGames",
  async (_, { rejectWithValue }) => {
    try {
      const games = await fetchGames();
      return games;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  games: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGamesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.games = action.payload; // Simpan data game ke state
      })
      .addCase(fetchGamesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default gamesSlice.reducer;
