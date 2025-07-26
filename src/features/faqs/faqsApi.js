// src/features/faqs/faqsApi.js

import publicApiClient from "../../lib/publicApiClient";

export const fetchFaqs = async () => {
  const response = await publicApiClient.get("/api/public/faqs");
  return response.data; // API ini langsung mengembalikan array
};
