// src/features/faqs/faqsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchFaqs } from "./faqsApi";

export const fetchFaqsThunk = createAsyncThunk(
  "faqs/fetchFaqs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchFaqs();
      // Filter untuk hanya menampilkan FAQ yang sudah di-publish
      const publishedFaqs = data.filter((faq) => faq.is_published);
      return publishedFaqs;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  faqs: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const faqsSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFaqsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.faqs = action.payload;
      })
      .addCase(fetchFaqsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default faqsSlice.reducer;
