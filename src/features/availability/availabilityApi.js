import publicApiClient from "../../lib/publicApiClient";
import { format } from "date-fns"; // Kita butuh ini untuk format tanggal

// Fungsi ini akan menerima unitId dan rentang tanggal
export const fetchDayAvailability = async ({ unitId, startDate, endDate }) => {
  const payload = {
    start_date: format(startDate, "yyyy-MM-dd"),
    end_date: format(endDate, "yyyy-MM-dd"),
  };
  const response = await publicApiClient.post(
    `/api/public/get-availability-day/${unitId}`,
    payload
  );
  return response.data;
};

export const fetchTimeAvailability = async ({ unitId, date }) => {
  const payload = {
    date: format(date, "yyyy-MM-dd"), // Format tanggal sesuai permintaan API
  };
  const response = await publicApiClient.post(
    `/api/public/get-availability-time/${unitId}`,
    payload
  );
  return response.data.slots; // Kita hanya butuh array 'slots'
};
