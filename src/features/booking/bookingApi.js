// src/features/booking/bookingApi.js
import apiClient from "../../lib/axios";
import publicApiClient from "../../lib/publicApiClient";
import { format, add } from "date-fns";

// Validate promo code using public API
export const validatePromoCode = async (promoName) => {
  try {
    const response = await publicApiClient.get(`/api/public/promos?name=${promoName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitBooking = async (bookingData) => {
  console.log("Raw booking data:", bookingData); // Debug log

  // Validate required customer data
  if (!bookingData.customer?.fullName || !bookingData.customer?.phone) {
    console.error("Missing customer data:", bookingData.customer);
    throw new Error("Customer name and phone are required");
  }

  // Format tanggal dan waktu sesuai yang diminta API
  const startTimeString = `${format(bookingData.date, "yyyy-MM-dd")} ${bookingData.startTime
    }`;
  const startDate = new Date(startTimeString.replace(" ", "T")); // Buat objek Date yang valid
  const endTime = add(startDate, { hours: bookingData.duration });
  const endTimeString = format(endTime, "yyyy-MM-dd HH:mm");

  // Format data F&B
  const fnbsPayload = bookingData.foodAndDrinks.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  // Validate required booking data
  if (!bookingData.psUnit?.id) {
    throw new Error("Unit ID is required");
  }
  if (!bookingData.selectedGames?.[0]?.id) {
    throw new Error("Game ID is required");
  }
  if (!bookingData.date || !bookingData.startTime) {
    throw new Error("Date and start time are required");
  }

  // Buat payload final sesuai format API
  const apiPayload = {
    unit_id: bookingData.psUnit.id,
    game_id: bookingData.selectedGames[0].id,
    promo_id: bookingData.promoId || null, // Use promo ID if available
    total_visitors: bookingData.numberOfPeople,
    start_time: startTimeString,
    end_time: endTimeString,
    notes: bookingData.notes || "",
    fnbs: fnbsPayload,
    // Customer data for guest booking
    name: bookingData.customer.fullName,
    phone: bookingData.customer.phone,
    email: bookingData.customer.email || "",
  };

  console.log("API Payload:", apiPayload); // Debug log
  console.log("Expected format:", {
    unit_id: "number",
    game_id: "number",
    name: "string",
    phone: "string",
    email: "string (optional)",
    promo_id: "number (optional)",
    total_visitors: "number",
    start_time: "YYYY-MM-DD HH:mm",
    end_time: "YYYY-MM-DD HH:mm",
    notes: "string (optional)",
    fnbs: "array of {id: number, quantity: number}"
  });

  // Gunakan endpoint yang benar untuk guest booking
  let response;
  let lastError;

  try {
    // Coba authenticated endpoint dulu
    response = await apiClient.post("/api/book-room", apiPayload);
    console.log("Authenticated booking successful");
  } catch (error) {
    console.error("Error with authenticated booking:", error);
    lastError = error;

    // Jika gagal, coba public endpoint untuk guest booking
    try {
      response = await publicApiClient.post("/api/public/book-room", apiPayload);
      console.log("Public booking successful");
    } catch (publicError) {
      console.error("Error with public booking:", publicError);
      lastError = publicError;

      // Coba endpoint alternatif
      try {
        response = await publicApiClient.post("/api/guest/book-room", apiPayload);
        console.log("Guest booking successful");
      } catch (guestError) {
        console.error("Error with guest booking:", guestError);
        lastError = guestError;

        // Jika semua gagal, throw error terakhir
        throw new Error(`All booking endpoints failed. Last error: ${lastError.message}`);
      }
    }
  }

  console.log("Booking Response:", response.data); // Debug log

  // Validate response
  if (!response.data) {
    throw new Error("No response data from booking API");
  }

  return response.data;
};
