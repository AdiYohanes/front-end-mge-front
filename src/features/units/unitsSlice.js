// src/features/units/unitsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUnits } from "./unitsApi";

export const fetchUnitsThunk = createAsyncThunk(
    "units/fetchUnits",
    async (params, { rejectWithValue }) => {
        // params adalah objek: { console_name, room_name }
        console.log("UnitsSlice - Fetching units with params:", params);
        try {
            const units = await fetchUnits(params);
            console.log("UnitsSlice - Units API returned:", units);
            return units;
        } catch (error) {
            console.log("UnitsSlice - Units API error:", error);
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    units: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const unitsSlice = createSlice({
    name: "units",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnitsThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUnitsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                console.log("UnitsSlice - Units API response:", action.payload);
                console.log("UnitsSlice - Units count:", action.payload?.length || 0);
                state.units = action.payload;
            })
            .addCase(fetchUnitsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default unitsSlice.reducer;
