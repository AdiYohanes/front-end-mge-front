import publicApiClient from "../../lib/publicApiClient";

export const fetchConsoles = async () => {
  const response = await publicApiClient.get("/api/public/consoles");
  return response.data.data; // Mengambil array 'data' dari response
};
