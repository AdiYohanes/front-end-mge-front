/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { submitBookingThunk, validatePromoThunk, clearPromoValidation } from "../features/booking/bookingSlice";
import BookingSummary from "../components/rent/BookingSummary";
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
  } = useSelector((state) => state.booking);
  const isLoading = bookingStatus === "loading";

  const initialBookingDetails = location.state?.bookingDetails || null;
  const isGuestBooking = location.state?.isGuestBooking || false;

  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails);
  const [promoCode, setPromoCode] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    agreed: false,
  });
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal
  const [showTermsModal, setShowTermsModal] = useState(false); // State untuk terms modal
  const [showPaymentModal, setShowPaymentModal] = useState(false); // State untuk payment modal
  const [showExitWarning, setShowExitWarning] = useState(false); // State untuk exit warning modal

  // Handle browser back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      e.preventDefault();
      setShowExitWarning(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!initialBookingDetails) {
      toast.error("Booking details not found, please start again.");
      navigate("/rent");
    }
  }, [initialBookingDetails, navigate]);

  useEffect(() => {
    if (redirectUrl) {
      // Buka modal payment dengan iframe Midtrans
      setShowPaymentModal(true);
    }
  }, [redirectUrl]);

  useEffect(() => {
    if (bookingStatus === "failed" && bookingError) {
      toast.error(bookingError);
    }
  }, [bookingStatus, bookingError]);

  // Handle promo validation response
  useEffect(() => {
    if (promoValidation.status === "succeeded" && promoValidation.promoData) {
      const promo = promoValidation.promoData;
      if (promo.is_active) {
        const discount = (bookingDetails.subtotal * promo.percentage) / 100;
        setBookingDetails((prev) => ({
          ...prev,
          voucherDiscount: discount,
          voucherCode: promo.name,
          promoId: promo.id,
          promoPercentage: promo.percentage,
        }));
        toast.success(`Voucher "${promo.name}" applied! ${promo.percentage}% discount`);
      } else {
        toast.error("This promo code is not active");
      }
    } else if (promoValidation.status === "failed") {
      toast.error(promoValidation.error || "Invalid promo code");
    }
  }, [promoValidation, bookingDetails.subtotal]);

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

    // Clear previous validation
    dispatch(clearPromoValidation());

    // Validate promo code using API
    dispatch(validatePromoThunk(promoCode.trim().toUpperCase()));
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
      !personalInfo.email ||
      !personalInfo.phoneNumber
    ) {
      toast.error("Please fill in all personal information fields.");
      return;
    }
    setIsModalOpen(true); // Buka modal jika validasi berhasil
  };

  // Fungsi ini dipanggil dari dalam modal untuk submit
  const handleSubmitBooking = () => {
    // Validate customer data before submitting
    if (!personalInfo.fullName || !personalInfo.phoneNumber) {
      toast.error("Name and phone number are required");
      return;
    }

    const finalData = {
      ...bookingDetails,
      notes: document.getElementById("booking-notes")?.value || "",
      customer: {
        fullName: personalInfo.fullName.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phoneNumber.trim(),
      },
    };

    console.log("Final Booking Data:", finalData); // Debug log
    console.log("Is Guest Booking:", isGuestBooking); // Debug log
    console.log("Personal Info:", personalInfo); // Debug log

    // Validate all required fields
    const requiredFields = [
      'psUnit', 'selectedGames', 'date', 'startTime', 'duration', 'numberOfPeople'
    ];

    const missingFields = requiredFields.filter(field => !finalData[field]);
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    dispatch(submitBookingThunk(finalData));
  };

  // Handle payment modal close
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    // Optional: Navigate back or show message
    toast.info("Payment was cancelled");
  };

  // Handle exit warning modal
  const handleContinueBooking = () => {
    setShowExitWarning(false);
  };

  const handleExitPage = () => {
    setShowExitWarning(false);
    navigate("/rent");
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
          <form onSubmit={handleProceed} className="lg:order-1 space-y-6">
            {isGuestBooking && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Guest Booking Information
                </h3>
                <p className="text-sm text-blue-700">
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
            <button
              type="submit"
              className="btn w-full bg-brand-gold text-white font-minecraft tracking-wider text-lg hover:bg-yellow-600"
            >
              Proceed to Payment
            </button>
          </form>
          <div className="lg:order-2">
            <BookingSummary
              details={bookingDetails}
              isPaymentPage={true}
              promoCode={promoCode}
              onPromoChange={(e) => setPromoCode(e.target.value)}
              onApplyPromo={handleApplyPromo}
              isPromoLoading={promoValidation.status === "loading"}
            />
          </div>
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

      {/* Exit Warning Modal - Menggunakan struktur ConfirmationModal */}
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
            <h3 className="text-lg font-bold mb-2">Exit Warning</h3>
            <div className="text-sm text-gray-500 mb-6">
              <p className="mb-2">Are you sure you want to exit this page?</p>
              <p className="font-semibold">Your booking process won't be saved.</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <button
                onClick={handleContinueBooking}
                className="btn bg-brand-gold text-white w-full"
              >
                Continue Booking
              </button>
              <button
                onClick={handleExitPage}
                className="btn btn-ghost w-full"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal dengan iframe Midtrans */}
      {showPaymentModal && redirectUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💳</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Payment Gateway</h3>
                  <p className="text-sm text-gray-600">Complete your payment securely</p>
                </div>
              </div>
              <button
                onClick={handleClosePaymentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* iframe Container */}
            <div className="flex-1 p-6">
              <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={redirectUrl}
                  className="w-full h-full"
                  title="Payment Gateway"
                  frameBorder="0"
                  allow="payment"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Powered by Midtrans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPaymentPage;
