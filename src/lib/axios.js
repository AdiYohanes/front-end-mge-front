// src/lib/axios.js

import axios from "axios";
import { store } from "../app/store"; // 1. Import Redux store

const apiClient = axios.create({
  baseURL: "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR DITAMBAHKAN DI SINI ---
// Kode ini akan berjalan secara otomatis SEBELUM setiap request dikirim
apiClient.interceptors.request.use(
  (config) => {
    // Ambil state saat ini dari Redux store
    const token = store.getState().auth.token;
    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
