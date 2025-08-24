// src/features/booking/bookingApi.js
import apiClient from "../../lib/axios";
import publicApiClient from "../../lib/publicApiClient";
import { format, add, isValid } from "date-fns";

// Validate promo code using public API
export const validatePromoCode = async (promoName) => {
  const response = await publicApiClient.get(`/api/public/promos?name=${promoName}`);
  return response.data;
};

export const submitBooking = async (bookingData) => {
  console.log("Raw booking data:", bookingData); // Debug log

  try {
    // Comprehensive data validation
    if (!bookingData) {
      throw new Error("Booking data is required");
    }

    // Validate required customer data
    if (!bookingData.customer?.fullName?.trim() || !bookingData.customer?.phone?.trim()) {
      console.error("Missing customer data:", bookingData.customer);
      throw new Error("Customer name and phone are required");
    }

    // Validate date and time
    if (!bookingData.date) {
      throw new Error("Booking date is required");
    }

    if (!bookingData.startTime?.trim()) {
      throw new Error("Start time is required");
    }

    if (!bookingData.duration || bookingData.duration <= 0) {
      throw new Error("Valid duration is required");
    }

    // Validate unit and game
    if (!bookingData.psUnit?.id || typeof bookingData.psUnit.id !== 'number') {
      throw new Error("Valid unit ID is required");
    }

    if (!bookingData.selectedGames?.[0]?.id || typeof bookingData.selectedGames[0].id !== 'number') {
      throw new Error("Valid game ID is required");
    }

    if (!bookingData.numberOfPeople || bookingData.numberOfPeople <= 0) {
      throw new Error("Number of people must be greater than 0");
    }

    // Format tanggal dan waktu dengan proper error handling
    let startTimeString, endTimeString;
    try {
      startTimeString = `${format(bookingData.date, "yyyy-MM-dd")} ${bookingData.startTime.trim()}`;
      const startDate = new Date(startTimeString.replace(" ", "T"));

      // Validate if date is valid
      if (!isValid(startDate)) {
        throw new Error("Invalid start date/time format");
      }

      const endTime = add(startDate, { hours: Number(bookingData.duration) });
      endTimeString = format(endTime, "yyyy-MM-dd HH:mm");
    } catch (dateError) {
      console.error("Date formatting error:", dateError);
      throw new Error("Invalid date or time format. Please check your booking details.");
    }

    // Format data F&B dengan validation
    let fnbsPayload = [];
    if (bookingData.foodAndDrinks && Array.isArray(bookingData.foodAndDrinks)) {
      fnbsPayload = bookingData.foodAndDrinks
        .filter(item => item && item.id && item.quantity > 0)
        .map((item) => ({
          id: Number(item.id),
          quantity: Number(item.quantity),
        }));
    }

    // Clean and validate customer data
    const customerName = bookingData.customer.fullName.trim();
    const customerPhone = bookingData.customer.phone.trim();
    const customerEmail = bookingData.customer.email?.trim() || "";

    // Validate phone format (basic)
    if (!/^[\d+\-() ]+$/.test(customerPhone)) {
      throw new Error("Invalid phone number format");
    }

    // Email is optional, only validate if provided
    if (customerEmail && customerEmail !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new Error("Invalid email format");
    }

    // Buat payload final sesuai format API
    const apiPayload = {
      unit_id: Number(bookingData.psUnit.id),
      game_id: Number(bookingData.selectedGames[0].id),
      promo_id: bookingData.promoId ? Number(bookingData.promoId) : null,
      total_visitors: Number(bookingData.numberOfPeople),
      start_time: startTimeString,
      end_time: endTimeString,
      notes: bookingData.notes?.trim() || "",
      fnbs: fnbsPayload,
      // Customer data for guest booking
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    };

    console.log("API Payload:", apiPayload); // Debug log
    console.log("Payload validation:", {
      unit_id_type: typeof apiPayload.unit_id,
      game_id_type: typeof apiPayload.game_id,
      total_visitors_type: typeof apiPayload.total_visitors,
      promo_id_type: typeof apiPayload.promo_id,
      start_time_format: apiPayload.start_time,
      end_time_format: apiPayload.end_time,
      fnbs_count: apiPayload.fnbs.length,
      name_length: apiPayload.name.length,
      phone_length: apiPayload.phone.length,
    });

    // Gunakan endpoint yang benar untuk guest booking
    let response;
    let lastError;

    try {
      // Coba authenticated endpoint dulu
      console.log("Attempting authenticated booking...");
      response = await apiClient.post("/api/book-room", apiPayload);
      console.log("Authenticated booking successful:", response.status);
    } catch (error) {
      console.error("Error with authenticated booking:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        config: error.config?.url
      });
      lastError = error;

      // Jika gagal, coba public endpoint untuk guest booking
      try {
        console.log("Attempting public booking...");
        response = await publicApiClient.post("/api/public/book-room", apiPayload);
        console.log("Public booking successful:", response.status);
      } catch (publicError) {
        console.error("Error with public booking:", {
          status: publicError.response?.status,
          message: publicError.response?.data?.message || publicError.message,
          data: publicError.response?.data,
          config: publicError.config?.url
        });
        lastError = publicError;

        // Coba endpoint alternatif
        try {
          console.log("Attempting guest booking...");
          response = await publicApiClient.post("/api/guest/book-room", apiPayload);
          console.log("Guest booking successful:", response.status);
        } catch (guestError) {
          console.error("Error with guest booking:", {
            status: guestError.response?.status,
            message: guestError.response?.data?.message || guestError.message,
            data: guestError.response?.data,
            config: guestError.config?.url
          });
          lastError = guestError;

          // Detailed error information for debugging
          const errorDetails = {
            lastStatus: lastError.response?.status,
            lastMessage: lastError.response?.data?.message || lastError.message,
            lastData: lastError.response?.data,
            payload: apiPayload
          };
          console.error("All booking endpoints failed. Error details:", errorDetails);

          // Throw more informative error
          const statusCode = lastError.response?.status;
          const serverMessage = lastError.response?.data?.message;

          if (statusCode === 500) {
            throw new Error(`Server error (500): ${serverMessage || 'Internal server error. Please check your booking details and try again.'}`);
          } else if (statusCode === 422) {
            throw new Error(`Validation error (422): ${serverMessage || 'Invalid booking data. Please check all fields.'}`);
          } else if (statusCode === 401) {
            throw new Error(`Authentication error (401): Please log in and try again.`);
          } else {
            throw new Error(`Booking failed (${statusCode || 'Unknown'}): ${serverMessage || lastError.message}`);
          }
        }
      }
    }

    console.log("Booking Response:", response); // Debug log
    console.log("Response Data:", response.data); // Debug log
    console.log("Response Status:", response.status); // Debug log

    // Validate response - some APIs might return data directly or in different structures
    if (!response) {
      throw new Error("No response from booking API");
    }

    if (!response.data && response.status !== 200 && response.status !== 201) {
      throw new Error("Invalid response from booking API");
    }

    // Handle different response structures and ensure serializable data
    let responseData = response.data || response;

    // If responseData is still the full axios response, extract only the data
    if (responseData && responseData.data && responseData.headers) {
      console.log("Detected full axios response, extracting data only");
      responseData = responseData.data;
    }

    // Ensure we return only serializable data (no axios headers, config, etc.)
    if (typeof responseData === 'object' && responseData !== null) {
      // Create a clean object without non-serializable properties
      const cleanData = JSON.parse(JSON.stringify(responseData));
      return cleanData;
    } else {
      console.warn("Unexpected response structure:", responseData);
      return responseData;
    }

  } catch (validationError) {
    // Re-throw validation errors from our checks above
    console.error("Booking validation error:", validationError);
    throw validationError;
  }
};
