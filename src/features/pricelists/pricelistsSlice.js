import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPricelists } from "./pricelistsApi";

export const fetchPricelistsThunk = createAsyncThunk(
    "pricelists/fetchPricelists",
    async (_, { rejectWithValue }) => {
        try {
            return await fetchPricelists();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    pricelists: [],
    status: "idle",
    error: null,
};

const pricelistsSlice = createSlice({
    name: "pricelists",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPricelistsThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPricelistsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.pricelists = action.payload;
            })
            .addCase(fetchPricelistsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default pricelistsSlice.reducer;
