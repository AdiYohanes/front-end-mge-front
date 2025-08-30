// src/features/auth/authApi.js

import apiClient from "../../lib/axios";

// Fungsi untuk login user (tetap sama)
export const loginUser = async (loginData) => {
  const apiPayload = {
    identifier: loginData.username,
    password: loginData.password,
  };
  const response = await apiClient.post("/api/auth/login", apiPayload);
  return response.data;
};

// --- FUNGSI REGISTER DIPERBARUI DI SINI ---
export const registerUser = async (registerData) => {
  // Mapping dari nama field form ke nama field API
  const apiPayload = {
    username: registerData.username,
    // role: "CUST", // BARIS INI DIHAPUS
    name: registerData.fullName,
    phone: registerData.phoneNumber,
    password: registerData.password,
    password_confirmation: registerData.confirmPassword,
  };

  // Only add email if it has a value
  if (registerData.email && registerData.email.trim() !== "") {
    apiPayload.email = registerData.email.trim();
  }

  try {
    const response = await apiClient.post("/api/auth/register", apiPayload);
    return response.data;
  } catch (error) {
    // Handle validation errors (422) with more detail
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        // Convert Laravel validation errors to readable format
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            // Map field names back to form field names
            const fieldMap = {
              'name': 'fullName',
              'phone': 'phoneNumber',
              'password_confirmation': 'confirmPassword'
            };
            const formField = fieldMap[field] || field;

            // Convert Laravel validation messages to user-friendly messages
            const friendlyMessages = messages.map(msg => {
              switch (msg) {
                case 'validation.unique':
                  if (field === 'email') return 'Email address is already registered';
                  if (field === 'username') return 'Username is already taken';
                  if (field === 'phone') return 'Phone number is already registered';
                  return `${field} already exists`;
                case 'validation.regex':
                  if (field === 'password') return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                  return `${field} format is invalid`;
                case 'validation.required':
                  return `${field} is required`;
                case 'validation.email':
                  return 'Please enter a valid email address';
                case 'validation.min.string':
                  return `${field} is too short`;
                case 'validation.max.string':
                  return `${field} is too long`;
                case 'validation.confirmed':
                  return 'Password confirmation does not match';
                default:
                  return msg;
              }
            });

            return `${formField}: ${friendlyMessages.join(', ')}`;
          })
          .join('; ');
        throw new Error(errorMessages);
      }
    }
    throw error;
  }
};

export const resendActivationToken = async (phone) => {
  const response = await apiClient.post("/api/auth/activate-account", {
    phone,
  });
  return response.data;
};

// Fungsi untuk verifikasi OTP
export const verifyOTP = async (otpData) => {
  console.log("Sending activate-account request with payload:", otpData);
  const response = await apiClient.post("/api/auth/activate-account", otpData);
  console.log("Activate account response:", response.data);
  return response.data;
};

export const requestResetToken = async (phoneData) => {
  // phoneData akan berisi { phone: '081...' }
  const response = await apiClient.post(
    "/api/auth/request-reset-token",
    phoneData
  );
  return response.data;
};
export const updateProfile = async (profileData) => {
  // profileData akan berisi objek dengan field yang diubah saja
  // Contoh: { name: "John Doe Junior" }
  const response = await apiClient.post(
    "/api/customer/update-profile",
    profileData
  );
  return response.data; // Asumsikan API mengembalikan data user yang sudah diupdate
};
