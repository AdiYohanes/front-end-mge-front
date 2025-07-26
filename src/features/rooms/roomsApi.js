import publicApiClient from "../../lib/publicApiClient";

export const fetchRooms = async () => {
  const response = await publicApiClient.get("/api/public/rooms");
  // API mengembalikan objek paginasi, kita butuh array 'data' di dalamnya
  return response.data.data;
};
