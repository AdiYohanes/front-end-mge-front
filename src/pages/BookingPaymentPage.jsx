/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { submitBookingThunk, validatePromoThunk, clearPromoValidation } from "../features/booking/bookingSlice";
import BookingSummary from "../components/rent/BookingSummary";
import publicApiClient from "../lib/publicApiClient";
import PersonalInfoForm from "../components/rent/PersonalInfoForm";
import ConfirmationModal from "../components/common/ConfirmationModal"; // Import modal
import TermsModal from "../components/common/TermsModal";
import toast from "react-hot-toast";

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
  const isLoading = bookingStatus === "loading";

  const initialBookingDetails = location.state?.bookingDetails || null;
  const isGuestBooking = location.state?.isGuestBooking || false;

  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails);
  const [promoCode, setPromoCode] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: "",
    agreed: false,
  });
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal
  const [showTermsModal, setShowTermsModal] = useState(false); // State untuk terms modal
  const [showPaymentModal, setShowPaymentModal] = useState(false); // State untuk payment modal
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
    const handleBeforeUnload = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

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

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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

  useEffect(() => {
    if (!initialBookingDetails) {
      console.error("Missing booking details on page load");
      console.error("Location state:", location.state);
      toast.error("Booking details not found, please start again.");
      navigate("/rent");
      return;
    }

    console.log("BookingPaymentPage loaded with details:", initialBookingDetails);
  }, [initialBookingDetails, navigate, location.state]);

  // Fallback listener: if the iframe posts a success-like message, redirect to success page
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      try {
        const data = event.data;
        if (!data) return;
        const status = data.transaction_status || data.status || data.resultType;
        const normalized = String(status || "").toLowerCase();
        const shouldRedirect = ["settlement", "capture", "success", "pending"].includes(normalized);
        if (shouldRedirect) {
          console.log("Payment successful, setting session marker");
          // Set session marker for successful payment
          sessionStorage.setItem("recentBookingComplete", "true");
          // Disable blocking for successful payment navigation
          setShouldBlock(false);

          const qs = invoiceNumber ? `?invoice_number=${encodeURIComponent(invoiceNumber)}` : "";
          navigate(`/booking-success${qs}`, {
            state: { paymentCompleted: true }
          });
        }
      } catch (_) {
        // ignore parse errors
      }
    };
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, [navigate, invoiceNumber]);

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
        setServiceFees(fees);
      } catch (err) {
        console.error("Failed to load taxes or service fees", err);
      }
    };
    fetchCharges();
  }, []);

  useEffect(() => {
    if (redirectUrl) {
      // Buka modal payment dengan iframe Midtrans
      setShowPaymentModal(true);
      // Disable blocking during payment process
      setShouldBlock(false);
    }
  }, [redirectUrl]);

  useEffect(() => {
    if (bookingStatus === "failed" && bookingError) {
      console.error("Booking failed with error:", bookingError);
      console.error("Booking status:", bookingStatus);
      console.error("Error type:", typeof bookingError); // Debug log
      console.error("Error stringified:", JSON.stringify(bookingError)); // Debug log

      // Check for specific phone number already exists error
      // The error message might be in different formats, so check multiple possibilities
      const errorMessage = String(bookingError).toLowerCase();
      console.log("Error message for debugging:", errorMessage); // Debug log

      // Check for phone number already exists error in various formats
      if (errorMessage.includes("a user with this phone number already exists") ||
        errorMessage.includes("phone number already exists") ||
        errorMessage.includes("user with this phone number") ||
        errorMessage.includes("already exists") ||
        (errorMessage.includes("404") && errorMessage.includes("server error"))) {
        console.log("Phone number error detected, showing custom message"); // Debug log
        toast.error("Nomor yang kamu gunakan telah terdaftar ! silakan login untuk booking");
      } else {
        console.log("Showing original error message:", bookingError); // Debug log
        toast.error(bookingError);
      }
    }
  }, [bookingStatus, bookingError]);

  // Handle promo validation response
  useEffect(() => {
    console.log("Promo validation status:", promoValidation.status); // Debug log
    console.log("Promo validation data:", promoValidation.promoData); // Debug log

    if (promoValidation.status === "succeeded" && promoValidation.promoData) {
      const promo = promoValidation.promoData;
      console.log("Processing promo data:", promo); // Debug log

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
        // Show toast for inactive promo code
        toast.error("Oops! Promo ini sudah tidak berlaku! Nantikan promo menarik dari kami.");
      }
    } else if (promoValidation.status === "failed") {
      // Show modal for promo code not found or API error
      setPromoModalMessage(promoValidation.error || "Kode promo tidak lagi tersedia");
      setShowPromoModal(true);
    }
  }, [promoValidation]);

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

    console.log("Applying promo code:", promoCode.trim().toUpperCase()); // Debug log
    console.log("Current booking details subtotal:", bookingDetails.subtotal); // Debug log

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
    if (!personalInfo.agreed) {
      toast.error("You must agree to the Terms & Conditions first.");
      return;
    }
    if (
      !personalInfo.fullName ||
      !personalInfo.phoneNumber
    ) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setIsModalOpen(true); // Buka modal jika validasi berhasil
  };

  // Fungsi ini dipanggil dari dalam modal untuk submit
  const handleSubmitBooking = () => {
    console.log("HandleSubmitBooking called");

    // Validate customer data before submitting
    if (!personalInfo.fullName || !personalInfo.phoneNumber) {
      toast.error("Name and phone number are required");
      return;
    }

    // Validate bookingDetails exists
    if (!bookingDetails) {
      console.error("No booking details available");
      toast.error("Booking details are missing. Please start the booking process again.");
      navigate("/rent");
      return;
    }

    const finalData = {
      ...bookingDetails,
      notes: document.getElementById("booking-notes")?.value || "",
      customer: {
        fullName: personalInfo.fullName.trim(),
        email: "", // Empty email since it's not required
        phone: personalInfo.phoneNumber.trim(),
      },
    };

    console.log("Final Booking Data:", finalData); // Debug log
    console.log("Is Guest Booking:", isGuestBooking); // Debug log
    console.log("Personal Info:", personalInfo); // Debug log

    // Validate all required fields with detailed logging
    const requiredFields = [
      'psUnit', 'selectedGames', 'date', 'startTime', 'duration', 'numberOfPeople'
    ];

    const missingFields = requiredFields.filter(field => {
      const fieldValue = finalData[field];
      const isMissing = !fieldValue;
      if (isMissing) {
        console.error(`Missing field '${field}':`, fieldValue);
      }
      return isMissing;
    });

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      console.error("Full final data:", finalData);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Additional validation for critical fields
    if (!finalData.psUnit?.id) {
      console.error("Missing PS Unit ID:", finalData.psUnit);
      toast.error("PS Unit information is missing");
      return;
    }

    if (!finalData.selectedGames?.[0]?.id) {
      console.error("Missing Game ID:", finalData.selectedGames);
      toast.error("Game selection is missing");
      return;
    }

    console.log("All validations passed, submitting booking...");
    dispatch(submitBookingThunk(finalData));
  };

  // Handle payment modal close
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    // Set session marker for fallback access
    sessionStorage.setItem("recentBookingComplete", "true");
    // Disable blocking for payment completion navigation
    setShouldBlock(false);
    // Redirect to success page as a fallback when payment flow ends
    const qs = invoiceNumber ? `?invoice_number=${encodeURIComponent(invoiceNumber)}` : "";
    navigate(`/booking-success${qs}`, {
      state: { paymentCompleted: true }
    });
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
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:order-1 space-y-6">
            {isGuestBooking && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-500 mb-2">
                  Guest Booking Information
                </h3>
                <p className="text-sm text-green-500">
                  Since you're booking as a guest, please provide your contact information below.
                </p>
              </div>
            )}
            <PersonalInfoForm
              formData={personalInfo}
              onFormChange={handleInfoChange}
              useLoginInfo={useLoginInfo}
              onUseLoginInfoChange={setUseLoginInfo}
              isGuestBooking={isGuestBooking}
            />
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes <span className="text-gray-500">(Optional)</span>
              </span>
              <textarea
                id="booking-notes"
                className="textarea textarea-bordered h-24 w-full bg-white border-gray-300 text-black placeholder-gray-500 focus:border-brand-gold focus:outline-none resize-none"
                placeholder="Request extra controller, etc."
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
                className="btn btn-outline border-red-500 text-red-600 hover:bg-red-50 w-full"
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
            <h3 className="text-lg font-bold mb-2">Promo Code Error</h3>
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

      {/* Payment Modal dengan iframe Midtrans - Full Screen */}
      {showPaymentModal && redirectUrl && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Close Button - Minimal */}
          <button
            onClick={handleClosePaymentModal}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* iframe Midtrans - Full Screen */}
          <iframe
            src={redirectUrl}
            className="w-full h-full"
            title="Payment Gateway"
            frameBorder="0"
            allow="payment"
          />
        </div>
      )}
    </>
  );
};

export default BookingPaymentPage;
