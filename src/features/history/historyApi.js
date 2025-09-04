import apiClient from "../../lib/axios";
import { format } from "date-fns";

export const fetchBookingHistory = async () => {
  // apiClient sudah otomatis menyertakan token
  const response = await apiClient.get("/api/customer/booking-history");
  return response.data.data; // Mengambil array 'data'
};


export const fetchBookingDetail = async (bookingId) => {
  const response = await apiClient.get(
    `/api/customer/booking-details/${bookingId}`
  );
  return response.data; // Response API sudah berisi objek detail
};
export const cancelBooking = async (bookingId) => {
  // Method POST, body bisa kosong jika tidak ada data tambahan yang perlu dikirim
  const response = await apiClient.post(
    `/api/customer/cancel/${bookingId}`,
    {}
  );
  return response.data;
};

export const rescheduleBooking = async (bookingId, rescheduleData) => {
  // Format start_time and end_time from the reschedule data
  const startTimeString = `${rescheduleData.new_date} ${rescheduleData.new_start_time}`;
  const startDate = new Date(startTimeString);
  const endDate = new Date(startDate.getTime() + rescheduleData.duration * 60 * 60 * 1000);
  const endTimeString = `${rescheduleData.new_date} ${format(endDate, "HH:mm")}`;

  const requestPayload = {
    start_time: startTimeString,
    end_time: endTimeString
  };

  const response = await apiClient.post(
    `/api/reschedule/${bookingId}`,
    requestPayload
  );
  return response.data;
};
