import publicApiClient from "../../lib/publicApiClient";

export const fetchRooms = async (consoleName = null) => {
  const params = consoleName ? { console_name: consoleName } : {};
  const response = await publicApiClient.get("/api/public/rooms", { params });
  // API mengembalikan objek paginasi, kita butuh array 'data' di dalamnya
  return response.data.data;
};
