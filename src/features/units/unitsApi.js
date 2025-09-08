// src/features/units/unitsApi.js

import publicApiClient from "../../lib/publicApiClient";

// Fungsi ini akan menerima nama konsol dan ruangan sebagai parameter
export const fetchUnits = async ({ console_name, room_name }) => {
    const response = await publicApiClient.get("/api/public/units", {
        params: {
            console_name,
            room_name,
        },
    });
    return response.data.data; // Mengambil array 'data' dari response
};
