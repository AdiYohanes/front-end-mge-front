// src/features/games/gamesApi.js

import publicApiClient from "../../lib/publicApiClient";

export const fetchGames = async () => {
  const response = await publicApiClient.get("/api/public/games");
  // API mengembalikan objek paginasi, kita butuh array 'data' di dalamnya
  return response.data.data;
};
