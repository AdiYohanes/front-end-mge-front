import publicApiClient from "../../lib/publicApiClient";
import apiClient from "../../lib/axios";

// Fetch F&B items
export const fetchFnbs = async () => {
  const response = await publicApiClient.get("/api/public/fnbs");
  return response.data;
};

// Fetch F&B categories
export const fetchFnbsCategories = async () => {
  const response = await publicApiClient.get("/api/public/fnb-category");
  return response.data;
};

// Book F&B items
export const bookFnbs = async (fnbData) => {
  // Validate required data
  if (!fnbData.fnbs || !Array.isArray(fnbData.fnbs) || fnbData.fnbs.length === 0) {
    throw new Error("F&B items are required");
  }

  // Use authenticated endpoint for all F&B bookings
  try {
    const response = await apiClient.post("/api/book-fnb", fnbData);
    return response.data;
  } catch (error) {
    // Re-throw the error with better message
    throw error;
  }
};
