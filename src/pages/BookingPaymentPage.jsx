/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { submitBookingThunk, validatePromoThunk, clearPromoValidation, clearBookingState } from "../features/booking/bookingSlice";
import BookingSummary from "../components/rent/BookingSummary";
import publicApiClient from "../lib/publicApiClient";
import PersonalInfoForm from "../components/rent/PersonalInfoForm";
import ConfirmationModal from "../components/common/ConfirmationModal"; // Import modal
import TermsModal from "../components/common/TermsModal";
import toast from "react-hot-toast";

// Constants for better readability
const MIDTRANS_SUCCESS_STATUSES = ['settlement', 'capture', 'success', 'pending'];
const MIDTRANS_FAILURE_STATUSES = ['cancel', 'cancelled', 'expire', 'expired', 'deny', 'denied'];

const BookingPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    status: bookingStatus,
    error: bookingError,
    redirectUrl,
    promoValidation,
    invoiceNumber,
  } = useSelector((state) => state.booking);

  // Get bookingData from booking state (similar to FoodPage.jsx)
  const bookingData = useSelector((state) => state.booking.bookingData);
  const { user } = useSelector((state) => state.auth);
  const isLoading = bookingStatus === "loading";

  const initialBookingDetails = location.state?.bookingDetails || null;
  const isGuestBooking = location.state?.isGuestBooking || false;
  const fromReward = location.state?.fromReward || false;
  const rewardData = location.state?.rewardData || null;
  const isOtsBooking = location.state?.isOtsBooking || false;

  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails);
  const [promoCode, setPromoCode] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: "",
    agreed: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [useLoginInfo, setUseLoginInfo] = useState(false);

  // Update bookingDetails when initialBookingDetails changes
  useEffect(() => {
    if (initialBookingDetails) {
      console.log("BookingPaymentPage - Updating bookingDetails with initialBookingDetails:", initialBookingDetails);
      setBookingDetails(initialBookingDetails);
    }
  }, [initialBookingDetails]);

  // Debug log for booking data
  useEffect(() => {
    console.log("BookingPaymentPage - Debug data:");
    console.log("  - isOtsBooking:", isOtsBooking);
    console.log("  - isGuestBooking:", isGuestBooking);
    console.log("  - fromReward:", fromReward);
    console.log("  - rewardData:", rewardData);
    console.log("  - bookingDetails:", bookingDetails);
    console.log("  - user role:", user?.role);
    console.log("  - paymentMethod:", paymentMethod);
    console.log("  - location.state:", location.state);
  }, [isOtsBooking, isGuestBooking, fromReward, rewardData, bookingDetails, user, paymentMethod, location.state]);

  // Auto-check personal info for reward booking since user is logged in and using rewards
  useEffect(() => {
    const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;
    if (userRewardId && user && !useLoginInfo) {
      console.log("BookingPaymentPage - Auto-checking personal info for reward booking");
      setUseLoginInfo(true);
    }
  }, [bookingDetails, rewardData, user, useLoginInfo]);

  // Populate personal info from user data when user is logged in and checkbox is checked
  useEffect(() => {
    if (user && !isOtsBooking && useLoginInfo) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: user.name || user.full_name || "",
        phoneNumber: user.phone || user.phone_number || "",
        // Don't auto-agree to terms, let user decide
      }));
    }
  }, [user, isOtsBooking, useLoginInfo]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal
  const [showTermsModal, setShowTermsModal] = useState(false); // State untuk terms modal
  const [showExitWarning, setShowExitWarning] = useState(false); // State untuk exit warning modal (back to booking)
  const [showNavigationWarning, setShowNavigationWarning] = useState(false); // State untuk navigation warning modal (other exits)
  const [showPromoModal, setShowPromoModal] = useState(false); // State untuk promo modal
  const [promoModalMessage, setPromoModalMessage] = useState(""); // State untuk pesan promo modal
  const [shouldBlock, setShouldBlock] = useState(true); // State untuk mengontrol navigation blocking

  const [taxInfo, setTaxInfo] = useState(null);
  const [serviceFees, setServiceFees] = useState([]);
  const navigationAttemptRef = useRef(null);

  // Handle browser back button and page refresh
  useEffect(() => {
    const handlePopState = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        setShowNavigationWarning(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add a state to prevent back navigation
    if (shouldBlock) {
      window.history.pushState(null, '', window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock]);

  // Custom navigation blocking for navbar/link clicks
  useEffect(() => {
    const handleLinkClick = (e) => {
      if (shouldBlock) {
        // Check if it's a navigation link
        const target = e.target.closest('a');
        if (target && target.getAttribute('href')) {
          const href = target.getAttribute('href');
          // Only block internal navigation, not external links
          if (href.startsWith('/') && !href.includes('/booking-success')) {
            e.preventDefault();
            e.stopPropagation();
            navigationAttemptRef.current = href;
            setShowNavigationWarning(true);
          }
        }
      }
    };

    // Add event listener to document to catch all link clicks
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [shouldBlock]);

  // Helper function to handle Midtrans redirect - moved up to avoid hoisting issues
  const handleMidtransRedirect = useCallback((transactionStatus, orderId) => {
    console.log("BookingPaymentPage - Processing Midtrans redirect:", {
      transactionStatus,
      orderId,
      currentUrl: window.location.href
    });

    // Clear payment timeout jika ada
    const timeoutId = sessionStorage.getItem("paymentTimeoutId");
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId, 10));
      sessionStorage.removeItem("paymentTimeoutId");
    }

    // Disable navigation blocking for any Midtrans redirect
    setShouldBlock(false);

    if (MIDTRANS_SUCCESS_STATUSES.includes(transactionStatus.toLowerCase())) {
      console.log("Detected Midtrans redirect with success status:", transactionStatus);

      // Set session marker for successful payment
      sessionStorage.setItem("recentBookingComplete", "true");

      // Redirect to success page
      const qs = orderId ? `?invoice_number=${encodeURIComponent(orderId)}` : "";
      console.log("BookingPaymentPage - Redirecting to success page:", `/booking-success${qs}`);

      navigate(`/booking-success${qs}`, {
        state: {
          paymentCompleted: true,
          bookingDetails: bookingDetails || null,
          isGuestBooking: isGuestBooking
        }
      });
    } else if (MIDTRANS_FAILURE_STATUSES.includes(transactionStatus.toLowerCase())) {
      console.log("Detected Midtrans redirect with cancelled status:", transactionStatus);

      navigate('/booking-cancelled', {
        state: {
          reason: "user_cancelled",
          message: "Anda telah membatalkan proses pembayaran di Midtrans",
          transactionStatus: transactionStatus,
          orderId: orderId
        }
      });
    } else {
      console.log("Detected Midtrans redirect with unknown status:", transactionStatus);

      // For unknown status, redirect to cancelled page as fallback
      navigate('/booking-cancelled', {
        state: {
          reason: "payment_failed",
          message: "Terjadi kesalahan dalam proses pembayaran",
          transactionStatus: transactionStatus,
          orderId: orderId
        }
      });
    }
  }, [navigate, bookingDetails, isGuestBooking]);

  useEffect(() => {
    // Check if this is a Midtrans redirect first
    const urlParams = new URLSearchParams(window.location.search);
    const transactionStatus = urlParams.get('transaction_status');

    if (transactionStatus && [...MIDTRANS_SUCCESS_STATUSES, ...MIDTRANS_FAILURE_STATUSES].includes(transactionStatus.toLowerCase())) {
      console.log("BookingPaymentPage - Direct Midtrans redirect detected, redirecting immediately");
      const orderId = urlParams.get('order_id');
      handleMidtransRedirect(transactionStatus, orderId);
      return;
    }

    if (!initialBookingDetails) {
      console.error("Missing booking details on page load");
      console.error("Location state:", location.state);
      toast.error("Booking details not found, please start again.");
      navigate("/rent");
      return;
    }

  }, [initialBookingDetails, navigate, location.state, handleMidtransRedirect]);

  // Fallback listener: if the iframe posts a success-like message, redirect to success page
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      try {
        const data = event.data;
        console.log("BookingPaymentPage - Received message:", data);
        if (!data) return;

        const status = data.transaction_status || data.status || data.resultType;
        const normalized = String(status || "").toLowerCase();
        console.log("BookingPaymentPage - Message status:", normalized);

        if (MIDTRANS_SUCCESS_STATUSES.includes(normalized)) {
          console.log("BookingPaymentPage - Message indicates success, redirecting...");
          const qs = invoiceNumber ? `?invoice_number=${encodeURIComponent(invoiceNumber)}` : "";
          navigate(`/booking-success${qs}`, {
            state: {
              paymentCompleted: true,
              bookingDetails: bookingDetails,
              isGuestBooking: isGuestBooking
            }
          });
        }
      } catch (error) {
        console.error("BookingPaymentPage - Error handling payment message:", error);
      }
    };

    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, [navigate, invoiceNumber, bookingDetails, isGuestBooking]);

  useEffect(() => {
    // Fetch taxes and service fee for payment calculation
    const fetchCharges = async () => {
      try {
        const [taxRes, feeRes] = await Promise.all([
          publicApiClient.get("/api/public/taxes"),
          publicApiClient.get("/api/public/services-fee"),
        ]);
        const activeTax = Array.isArray(taxRes.data)
          ? taxRes.data.find((t) => t.is_active)
          : null;
        const fees = Array.isArray(feeRes.data) ? feeRes.data : [];
        setTaxInfo(activeTax || null);
        // Set service fees to 0 if there's a reward or OTS booking
        const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;
        setServiceFees(userRewardId || isOtsBooking ? [] : fees);
      } catch (err) {
        console.error("Failed to load taxes or service fees", err);
      }
    };
    fetchCharges();
  }, [bookingDetails, rewardData, isOtsBooking]);



  // Handle promo validation response
  useEffect(() => {

    if (promoValidation.status === "succeeded" && promoValidation.promoData) {
      const promo = promoValidation.promoData;

      // Check if the entered promo code exactly matches the promo code from API
      if (promo.promo_code && promo.promo_code.toUpperCase() !== promoCode.trim().toUpperCase()) {
        // Promo code doesn't match exactly
        setPromoModalMessage("Promo yang Anda masukan tidak ditemukan");
        setShowPromoModal(true);
        return;
      }

      if (promo.is_active) {
        setBookingDetails((prev) => {
          if (!prev) return prev; // Safety check
          const discount = (prev.subtotal * promo.percentage) / 100;
          return {
            ...prev,
            voucherDiscount: discount,
            voucherCode: `PROMO ${promo.promo_code}`,
            promoId: promo.id,
            promoPercentage: promo.percentage,
          };
        });
        toast.success(`Voucher "${promo.promo_code}" applied! ${promo.percentage}% discount`);
      } else {
        // Inactive promo code - no message shown
      }
    } else if (promoValidation.status === "failed") {
      // Show modal for promo code not found or API error
      setPromoModalMessage(promoValidation.error || "Promo yang Anda masukan tidak ditemukan");
      setShowPromoModal(true);
    }
  }, [promoValidation, promoCode]);

  // Handle booking success - same logic as FoodPage.jsx
  useEffect(() => {
    if (bookingStatus === "succeeded" && bookingData?.data) {
      const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;

      // If there's a reward or OTS booking, don't redirect to Midtrans
      if (userRewardId || isOtsBooking) {
        console.log("BookingPaymentPage - Reward/OTS booking completed, skipping Midtrans");
        toast.success(isOtsBooking ? "OTS booking submitted successfully!" : "Booking submitted successfully! Your reward has been applied.");

        // Disable blocking for success navigation
        setShouldBlock(false);

        // Redirect to success page for reward/OTS booking
        navigate(`/booking-success?invoice_number=${encodeURIComponent(invoiceNumber)}`, {
          state: {
            paymentCompleted: true,
            isReward: !!userRewardId,
            isOts: isOtsBooking,
            isGuestBooking: isGuestBooking,
            bookingDetails: bookingDetails
          }
        });
      } else {
        // Check if snapUrl is available for direct redirect (normal booking) - same as FoodPage.jsx
        if (bookingData.snapUrl) {
          // Validate snapUrl before redirecting
          const snapUrl = bookingData.snapUrl;
          console.log("BookingPaymentPage - snapUrl received:", snapUrl);

          // Check if snapUrl is a valid Midtrans URL
          if (snapUrl.includes('midtrans') || snapUrl.includes('snap')) {
            // Show redirect message first
            toast.success("Booking submitted successfully! Redirecting to payment...");

            // Redirect to Midtrans snap URL after a short delay
            setTimeout(() => {
              window.location.href = snapUrl;
            }, 1500);
          } else {
            // COMMENTED FOR TESTING - Invalid snapUrl, use fallback
            // console.warn("Invalid snapUrl detected, using fallback success page:", snapUrl);
            // navigate(`/booking-success?invoice_number=${encodeURIComponent(invoiceNumber)}`, {
            //   state: {
            //     paymentCompleted: true,
            //     bookingDetails: bookingDetails
            //   }
            // });
          }
        } else {
          // COMMENTED FOR TESTING - Fallback to success page with order details
          // console.warn("No snapUrl available, using fallback success page");
          // navigate(`/booking-success?invoice_number=${encodeURIComponent(invoiceNumber)}`, {
          //   state: {
          //     paymentCompleted: true,
          //     bookingDetails: bookingDetails
          //   }
          // });
        }
      }

      // Reset booking status
      dispatch(clearBookingState());
    } else if (bookingStatus === "failed" && bookingError) {
      console.error("Booking failed with error:", bookingError);

      // Handle validation errors
      if (bookingError.errors) {
        // Show specific validation errors
        Object.entries(bookingError.errors).forEach(([field, messages]) => {
          const fieldName = field === 'fnbs' ? 'Food & Drinks' : field;
          toast.error(`${fieldName}: ${messages[0]}`);
        });
      } else {
        // Show general error message
        toast.error(bookingError?.message || "Failed to submit booking. Please try again.");
      }
    }
  }, [bookingStatus, bookingData, bookingDetails, rewardData, isOtsBooking, isGuestBooking, navigate, dispatch, bookingError, invoiceNumber]);

  const handleInfoChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    if (!bookingDetails) {
      toast.error("Booking details not available. Please try again.");
      return;
    }


    // Clear previous validation
    dispatch(clearPromoValidation());

    // Validate promo code using API
    dispatch(validatePromoThunk(promoCode.trim().toUpperCase()));
  };

  const handleRemovePromo = () => {
    // Reset promo code and clear validation
    setPromoCode("");
    dispatch(clearPromoValidation());

    // Remove promo from booking details
    setBookingDetails((prev) => ({
      ...prev,
      voucherDiscount: 0,
      voucherCode: "",
      promoId: null,
      promoPercentage: 0,
    }));

    toast.success("Promo code removed successfully");
  };

  // Fungsi ini sekarang hanya untuk validasi dan membuka modal
  const handleProceed = (e) => {
    e.preventDefault();

    const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;

    // For reward booking with logged in user, skip personal info validation
    // For OTS booking, always require personal info (customer info)
    // For guest users (reward or normal), require personal info
    // For logged-in users making normal bookings, skip personal info validation
    if (!user && !isOtsBooking) {
      if (!personalInfo.agreed) {
        toast.error("You must agree to the Terms & Conditions first.");
        return;
      }
      if (!personalInfo.fullName || !personalInfo.phoneNumber) {
        toast.error("Please fill in your name and phone number.");
        return;
      }
    }

    // For OTS booking, require customer info
    if (isOtsBooking) {
      if (!personalInfo.fullName || !personalInfo.phoneNumber) {
        toast.error("Please fill in customer name and phone number for OTS booking.");
        return;
      }
    }

    setIsModalOpen(true); // Buka modal jika validasi berhasil
  };

  // Helper function to validate required fields
  const validateRequiredFields = (data, fields, bookingType) => {
    const missingFields = fields.filter(field => {
      const fieldValue = data[field];
      const isMissing = !fieldValue || fieldValue === null || fieldValue === undefined;
      if (isMissing) {
        console.error(`Missing field '${field}':`, fieldValue);
      }
      return isMissing;
    });

    if (missingFields.length > 0) {
      console.error(`Missing required fields for ${bookingType}:`, missingFields);
      console.error("Full data:", data);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  // Helper function to build time strings
  const buildTimeStrings = (date, time, duration) => {
    console.log("buildTimeStrings - Input:", { date, time, duration });

    // Validate inputs
    if (!date) {
      throw new Error("Date is required for time calculation");
    }

    if (!time) {
      throw new Error("Start time is required for time calculation");
    }

    if (!duration || duration <= 0) {
      throw new Error("Valid duration is required for time calculation");
    }

    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Validate date
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date provided");
    }

    // Format date as YYYY-MM-DD
    const dateStr = dateObj.toISOString().split('T')[0];

    // Ensure time is in HH:MM format
    const timeStr = time;

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
      throw new Error("Invalid time format. Expected HH:MM");
    }

    // Create start datetime
    const startDateTime = new Date(`${dateStr}T${timeStr}:00`);
    console.log("buildTimeStrings - Start datetime:", startDateTime);

    // Validate start datetime
    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid start datetime");
    }

    // Calculate end datetime
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));
    console.log("buildTimeStrings - End datetime:", endDateTime);

    // Format as YYYY-MM-DD HH:MM (without seconds to match API expectation)
    const startTime = `${dateStr} ${timeStr}`;
    const endTime = `${endDateTime.toISOString().split('T')[0]} ${endDateTime.toTimeString().split(' ')[0].substring(0, 5)}`;

    console.log("buildTimeStrings - Result:", { start_time: startTime, end_time: endTime });

    return {
      start_time: startTime,
      end_time: endTime
    };
  };

  // Helper function to validate booking details
  const validateBookingDetails = () => {
    if (!bookingDetails) {
      console.error("No booking details available");
      toast.error("Booking details are missing. Please start the booking process again.");
      navigate("/rent");
      return false;
    }

    const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;

    if (userRewardId) {
      if (!bookingDetails.psUnit?.id) {
        toast.error("PS Unit selection is missing. Please go back to select a unit.");
        return false;
      }
      if (!bookingDetails.selectedGames?.[0]?.id) {
        toast.error("Game selection is missing. Please go back to select a game.");
        return false;
      }
    }

    return true;
  };

  // Helper function to validate personal info
  const validatePersonalInfo = () => {
    if (!user && !isOtsBooking && (!personalInfo.fullName || !personalInfo.phoneNumber)) {
      toast.error("Name and phone number are required");
      return false;
    }
    if (isOtsBooking && (!personalInfo.fullName || !personalInfo.phoneNumber)) {
      toast.error("Customer name and phone number are required for OTS booking");
      return false;
    }
    return true;
  };

  // Fungsi ini dipanggil dari dalam modal untuk submit
  const handleSubmitBooking = () => {
    // Check if bookingDetails is available
    if (!bookingDetails) {
      console.error("BookingPaymentPage - bookingDetails is null or undefined");
      toast.error("Booking details are missing. Please start the booking process again.");
      navigate("/rent");
      return;
    }

    const userRewardId = bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id;

    // Debug logging for reward booking
    console.log("BookingPaymentPage - Reward booking debug:");
    console.log("  - userRewardId:", userRewardId);
    console.log("  - bookingDetails:", bookingDetails);
    console.log("  - bookingDetails.psUnit:", bookingDetails.psUnit);
    console.log("  - bookingDetails.selectedGames:", bookingDetails.selectedGames);
    console.log("  - bookingDetails.date:", bookingDetails.date);
    console.log("  - bookingDetails.startTime:", bookingDetails.startTime);
    console.log("  - bookingDetails.duration:", bookingDetails.duration);
    console.log("  - bookingDetails.numberOfPeople:", bookingDetails.numberOfPeople);

    // Validate all required data
    if (!validateBookingDetails() || !validatePersonalInfo()) return;

    // Build final data based on booking type
    let finalData;

    try {
      // Validate required fields for reward booking
      if (userRewardId) {
        if (!bookingDetails.date) {
          throw new Error("Date is required for reward booking");
        }
        if (!bookingDetails.startTime) {
          throw new Error("Start time is required for reward booking");
        }
        if (!bookingDetails.duration) {
          throw new Error("Duration is required for reward booking");
        }
      }

      finalData = userRewardId ? {
        // Reward booking structure
        user_reward_id: parseInt(userRewardId),
        unit_id: parseInt(bookingDetails.psUnit.id),
        game_id: parseInt(bookingDetails.selectedGames[0].id),
        total_visitors: parseInt(bookingDetails.numberOfPeople) || 1,
        ...(() => {
          try {
            return buildTimeStrings(
              bookingDetails.date,
              bookingDetails.startTime,
              bookingDetails.duration || 1
            );
          } catch (error) {
            console.error("BookingPaymentPage - Error building time strings:", error);
            throw new Error(`Time calculation failed: ${error.message}`);
          }
        })(),
        notes: document.getElementById("booking-notes")?.value || "No F&B needed.",
        ...(!user && {
          name: personalInfo.fullName.trim(),
          phone: personalInfo.phoneNumber.trim(),
        })
      } : isOtsBooking ? {
        // OTS booking structure
        unit_id: parseInt(bookingDetails.psUnit.id),
        game_id: parseInt(bookingDetails.selectedGames[0].id),
        name: personalInfo.fullName.trim(),
        phone: personalInfo.phoneNumber.trim(),
        total_visitors: parseInt(bookingDetails.numberOfPeople),
        payment_method: paymentMethod,
        ...buildTimeStrings(bookingDetails.date, bookingDetails.startTime, bookingDetails.duration),
        notes: document.getElementById("booking-notes")?.value || "OTS Booking.",
        fnbs: (bookingDetails.foodAndDrinks || []).map(item => ({
          id: parseInt(item.id),
          quantity: parseInt(item.quantity)
        }))
      } : {
        // Normal booking structure
        ...bookingDetails,
        notes: document.getElementById("booking-notes")?.value || "",
        customer: {
          fullName: user ? (user.name || user.full_name || "") : personalInfo.fullName.trim(),
          email: user ? (user.email || "") : "",
          phone: user ? (user.phone || user.phone_number || "") : personalInfo.phoneNumber.trim(),
        },
      };
    } catch (error) {
      console.error("Error building final data:", error);
      toast.error(`Error preparing booking data: ${error.message}`);
      return;
    }

    console.log("BookingPaymentPage - Final data to be submitted:", finalData);

    // Validate final data based on booking type
    const validationFields = userRewardId
      ? ['user_reward_id', 'unit_id', 'game_id', 'total_visitors', 'start_time', 'end_time']
      : isOtsBooking
        ? ['unit_id', 'game_id', 'name', 'phone', 'total_visitors', 'payment_method', 'start_time', 'end_time']
        : ['psUnit', 'selectedGames', 'date', 'startTime', 'duration', 'numberOfPeople'];

    // Additional validation for reward booking
    if (userRewardId) {
      // Check if date and time are provided and valid
      if (!bookingDetails.date) {
        console.error("Missing date for reward booking:", bookingDetails.date);
        toast.error("Please select a date for your reward booking");
        return;
      }

      if (!bookingDetails.startTime) {
        console.error("Missing start time for reward booking:", bookingDetails.startTime);
        toast.error("Please select a start time for your reward booking");
        return;
      }

      // Check if the selected time is in the future (with 30 minutes tolerance for reward booking)
      const selectedDateTime = new Date(`${bookingDetails.date.toISOString().split('T')[0]}T${bookingDetails.startTime}:00`);
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now

      console.log("BookingPaymentPage - Time validation for reward booking:");
      console.log("  - Selected time:", selectedDateTime);
      console.log("  - Selected time (local):", selectedDateTime.toLocaleString());
      console.log("  - Current time:", now);
      console.log("  - Current time (local):", now.toLocaleString());
      console.log("  - 30 minutes from now:", thirtyMinutesFromNow);
      console.log("  - 30 minutes from now (local):", thirtyMinutesFromNow.toLocaleString());
      console.log("  - Selected time is before 30 minutes from now:", selectedDateTime < thirtyMinutesFromNow);
      console.log("  - Time difference (minutes):", (selectedDateTime.getTime() - now.getTime()) / (1000 * 60));

      // For reward booking, allow same day booking with 30 minutes advance notice
      if (selectedDateTime < thirtyMinutesFromNow) {
        console.error("Selected time is too close to current time for reward booking:", selectedDateTime, "Current time:", now);
        toast.error("Please select a time at least 30 minutes from now for your reward booking");
        return;
      }

      // Check if total_visitors is a valid number
      if (!finalData.total_visitors || isNaN(finalData.total_visitors) || finalData.total_visitors < 1) {
        console.error("Invalid total_visitors for reward booking:", finalData.total_visitors);
        toast.error("Invalid number of visitors for reward booking");
        return;
      }

      // Check if unit_id and game_id are valid numbers
      if (!finalData.unit_id || isNaN(finalData.unit_id)) {
        console.error("Invalid unit_id for reward booking:", finalData.unit_id);
        toast.error("Invalid unit selection for reward booking");
        return;
      }

      if (!finalData.game_id || isNaN(finalData.game_id)) {
        console.error("Invalid game_id for reward booking:", finalData.game_id);
        toast.error("Invalid game selection for reward booking");
        return;
      }
    }

    if (!validateRequiredFields(finalData, validationFields, userRewardId ? 'reward' : isOtsBooking ? 'OTS' : 'normal')) {
      return;
    }

    // Additional validation for normal booking
    if (!userRewardId && !isOtsBooking) {
      if (!finalData.psUnit?.id) {
        toast.error("PS Unit information is missing");
        return;
      }
      if (!finalData.selectedGames?.[0]?.id) {
        toast.error("Game selection is missing");
        return;
      }
    }

    console.log("BookingPaymentPage - Submitting booking data:", finalData);
    dispatch(submitBookingThunk(finalData));
  };


  // Handle exit warning modal (back to booking button)
  const handleContinueBooking = () => {
    setShowExitWarning(false);
    navigationAttemptRef.current = null;
  };

  const handleExitPage = () => {
    setShowExitWarning(false);
    setShouldBlock(false); // Disable blocking for this navigation

    // Reset personal information and promo code
    setPersonalInfo({
      fullName: "",
      phoneNumber: "",
      agreed: false,
    });
    setPromoCode("");
    setUseLoginInfo(false);

    // Clear any promo validation
    dispatch(clearPromoValidation());

    // Navigate back to RentPage step 4 (FnB selection) with preserved booking data
    navigate("/rent", {
      state: {
        bookingDetails,
        currentStep: 4,
        preserveData: true
      }
    });
  };

  // Handle navigation warning modal (other navigation attempts)
  const handleContinuePayment = () => {
    setShowNavigationWarning(false);
    navigationAttemptRef.current = null;
  };

  const handleConfirmExit = () => {
    setShowNavigationWarning(false);
    setShouldBlock(false); // Disable blocking for this navigation

    // Reset personal information and promo code
    setPersonalInfo({
      fullName: "",
      phoneNumber: "",
      agreed: false,
    });
    setPromoCode("");
    setUseLoginInfo(false);

    // Clear any promo validation
    dispatch(clearPromoValidation());

    // If there was a navigation attempt, proceed with it
    if (navigationAttemptRef.current) {
      const targetPath = navigationAttemptRef.current;
      navigationAttemptRef.current = null;
      // Small delay to ensure shouldBlock state is updated
      setTimeout(() => {
        navigate(targetPath);
      }, 10);
    } else {
      // Fallback to home page
      navigate("/");
    }
  };

  if (!bookingDetails) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowExitWarning(true)}
            className="btn btn-ghost text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Booking
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-minecraft">
            Payment Details
          </h1>
          {isGuestBooking && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 font-medium">
                📝 Guest Booking - Please fill in your personal information below
              </p>
            </div>
          )}
          {isOtsBooking && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-800 font-medium">
                🏪 OTS Booking - Please fill in customer information below
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:order-1 space-y-6">
            {/* Reward Booking Banner */}
            {(bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id) && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  🎁 Reward Booking
                </h3>
                <p className="text-sm text-green-600">
                  Your reward has been applied! Personal information is optional for reward bookings.
                </p>
              </div>
            )}

            {/* Guest Booking Banner */}
            {isGuestBooking && !(bookingDetails?.rewardInfo?.userRewardId || rewardData?.user_reward_id) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-500 mb-2">
                  Guest Booking Information
                </h3>
                <p className="text-sm text-green-500">
                  Since you're booking as a guest, please provide your contact information below.
                </p>
              </div>
            )}

            {/* Personal Info Form - Always show */}
            <PersonalInfoForm
              formData={personalInfo}
              onFormChange={handleInfoChange}
              useLoginInfo={useLoginInfo}
              onUseLoginInfoChange={setUseLoginInfo}
              isGuestBooking={isGuestBooking}
            />
            {/* Payment Method - Only show for OTS booking */}
            {isOtsBooking && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method <span className="text-red-500">*</span>
                </span>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-primary"
                    />
                    <span className="text-gray-700">💵 Cash</span>
                  </label>
                </div>
              </div>
            )}

            {/* Additional Notes - Always show */}
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes <span className="text-gray-500">(Optional)</span>
              </span>
              <textarea
                id="booking-notes"
                className="textarea textarea-bordered h-24 w-full bg-white border-gray-300 text-black placeholder-gray-500 focus:border-brand-gold focus:outline-none resize-none"
                placeholder={isOtsBooking ? "OTS booking notes..." : "Request extra controller, etc."}
              ></textarea>
            </div>
          </div>

          <div className="lg:order-2">
            <BookingSummary
              details={bookingDetails}
              isPaymentPage={true}
              promoCode={promoCode}
              onPromoChange={(e) => setPromoCode(e.target.value)}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
              isPromoLoading={promoValidation.status === "loading"}
              taxInfo={taxInfo}
              serviceFees={serviceFees}
            />
          </div>
        </div>

        {/* Proceed to Payment Button - Full Width at Bottom */}
        <div className="mt-12">
          <button
            onClick={handleProceed}
            className="btn w-full bg-brand-gold text-white font-minecraft tracking-wider text-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Proceed to Payment
          </button>

          {/* Redirect Message - same as FoodPage.jsx */}
          {bookingStatus === "succeeded" && bookingData?.snapUrl && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                🚀 Redirecting to payment gateway...
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Please wait while we redirect you to complete your payment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSubmitBooking}
        title="Are you sure you want to continue booking the room?"
        imageSrc="/images/tanya.png"
        confirmText="Confirm Booking"
        isLoading={isLoading}
      >
      </ConfirmationModal>

      {/* Exit Warning Modal - Back to Booking Button */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            {/* Gambar Kustom di Atas - Sama dengan ConfirmationModal */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/tanya.png"
                alt="warning icon"
                className="h-16 w-auto"
              />
            </div>

            {/* Judul & Children (Isi Pesan) */}
            <h3 className="text-lg font-bold mb-2 text-gray-800">Change of plans?</h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="leading-relaxed">You'll be redirected to the booking page to adjust your reservation</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <button
                onClick={handleContinueBooking}
                className="btn bg-brand-gold text-white w-full"
              >
                Continue Payment
              </button>
              <button
                onClick={handleExitPage}
                className="btn btn-ghost w-full"
              >
                Adjust Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Warning Modal - Other Navigation Attempts */}
      {showNavigationWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            {/* Gambar Kustom di Atas */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/cancel.png"
                alt="warning icon"
                className="h-16 w-auto"
              />
            </div>

            {/* Judul & Children (Isi Pesan) */}
            <h3 className="text-lg font-bold mb-2 text-gray-800">Are you sure you want to exit?</h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="leading-relaxed">Your booking data will not be saved and you'll need to start over</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <button
                onClick={handleContinuePayment}
                className="btn bg-brand-gold text-white w-full"
              >
                Continue Payment
              </button>
              <button
                onClick={handleConfirmExit}
                className="btn btn-outline border-black text-red-600 hover:bg-red-50 w-full"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/tanya.png"
                alt="warning icon"
                className="h-16 w-auto"
              />
            </div>

            {/* Message */}
            <h3 className="text-lg font-bold mb-2">Promo Code Not Found</h3>
            <div className="text-sm text-gray-500 mb-6">
              <p>{promoModalMessage}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPromoModal(false)}
              className="btn bg-brand-gold text-white w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default BookingPaymentPage;
