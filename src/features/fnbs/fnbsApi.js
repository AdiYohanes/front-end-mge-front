import publicApiClient from "../../lib/publicApiClient";

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

  if (!fnbData.name || !fnbData.phone) {
    throw new Error("Name and phone are required for guest booking");
  }

  const response = await publicApiClient.post("/api/book-fnb", fnbData);
  return response.data;
};
