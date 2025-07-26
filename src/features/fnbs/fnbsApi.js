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
    const response = await publicApiClient.post("/api/book-fnb", fnbData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
