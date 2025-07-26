/* eslint-disable no-unused-vars */
// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  resendActivationToken,
  requestResetToken,
  updateProfile,
  verifyOTP,
} from "./authApi";

export const login = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const data = await loginUser(loginData);
      // Simpan token DAN user ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Ubah objek user menjadi string
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (registerData, { rejectWithValue }) => {
    try {
      const data = await registerUser(registerData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  "auth/verifyOTP",
  async (otpData, { rejectWithValue }) => {
    try {
      const data = await verifyOTP(otpData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const requestResetTokenThunk = createAsyncThunk(
  "auth/requestResetToken",
  async (phoneData, { rejectWithValue }) => {
    try {
      const data = await requestResetToken(phoneData);
      return data.message;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const resendTokenThunk = createAsyncThunk(
  "auth/resendToken",
  async (phone, { rejectWithValue }) => {
    try {
      const data = await resendActivationToken(phone);
      return data.message;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);
export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await updateProfile(profileData);
      return data.user; // Mengembalikan objek user yang baru
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

const initialState = {
  // Coba ambil data user dari localStorage, jika tidak ada, gunakan null
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  registrationPhone: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Hapus user DAN token dari localStorage saat logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
    setRegistrationPhone: (state, action) => {
      state.registrationPhone = action.payload;
    },
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(verifyOTPThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOTPThunk.fulfilled, (state) => {
        state.status = "succeeded";
        // Clear registration phone after successful verification
        state.registrationPhone = null;
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(resendTokenThunk.pending, (state) => {
        // Bisa tambahkan state loading khusus resend jika perlu
        console.log("Resending token...");
      })
      .addCase(resendTokenThunk.fulfilled, (state, action) => {
        console.log("Token resent successfully:", action.payload);
      })
      .addCase(resendTokenThunk.rejected, (state, action) => {
        console.error("Failed to resend token:", action.payload);
      })
      .addCase(requestResetTokenThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(requestResetTokenThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(requestResetTokenThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, setRegistrationPhone, resetStatus } = authSlice.actions;

export default authSlice.reducer;
