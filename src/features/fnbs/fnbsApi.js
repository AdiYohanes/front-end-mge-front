import publicApiClient from "../../lib/publicApiClient";

// Fetch F&B items
export const fetchFnbs = async () => {
  try {
    const response = await publicApiClient.get("/api/public/fnbs");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch F&B categories
export const fetchFnbsCategories = async () => {
  try {
    const response = await publicApiClient.get("/api/public/fnb-category");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Book F&B items
export const bookFnbs = async (fnbData) => {
  try {
    console.log("F&B Booking Data:", fnbData); // Debug log
    
    // Validate required data
    if (!fnbData.fnbs || !Array.isArray(fnbData.fnbs) || fnbData.fnbs.length === 0) {
      throw new Error("F&B items are required");
    }
    
    if (!fnbData.name || !fnbData.phone) {
      throw new Error("Name and phone are required for guest booking");
    }
    
    const response = await publicApiClient.post("/api/book-fnb", fnbData);
    console.log("F&B Booking Response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("F&B Booking Error:", error);
    throw error;
  }
};
