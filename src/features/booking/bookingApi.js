// src/features/booking/bookingApi.js
import apiClient from "../../lib/axios";
import { format, add } from "date-fns";

export const submitBooking = async (bookingData) => {
  // Format tanggal dan waktu sesuai yang diminta API
  const startTimeString = `${format(bookingData.date, "yyyy-MM-dd")} ${
    bookingData.startTime
  }`;
  const startDate = new Date(startTimeString.replace(" ", "T")); // Buat objek Date yang valid
  const endTime = add(startDate, { hours: bookingData.duration });
  const endTimeString = format(endTime, "yyyy-MM-dd HH:mm");

  // Format data F&B
  const fnbsPayload = bookingData.foodAndDrinks.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  // Buat payload final sesuai format API
  const apiPayload = {
    unit_id: bookingData.psUnit.id,
    game_id: bookingData.selectedGames[0].id,
    promo_id: null, // Ganti dengan logika promo jika sudah ada
    total_visitors: bookingData.numberOfPeople,
    start_time: startTimeString,
    end_time: endTimeString,
    notes: bookingData.notes,
    fnbs: fnbsPayload,
  };

  const response = await apiClient.post("/api/book-room", apiPayload);
  return response.data;
};
