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

  useEffect(() => {
    if (!initialBookingDetails) {
      toast.error("Booking details not found, please start again.");
      navigate("/rent");
    }
  }, [initialBookingDetails, navigate]);

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
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

  if (!bookingDetails) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-16 lg:py-24">
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
            <div className="form-control">
              <label className="label">
                <span className="label-text">Additional Notes (Optional)</span>
              </label>
              <textarea
                id="booking-notes"
                className="textarea textarea-bordered h-24"
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
        title="Confirm Booking"
        message="Are you sure you want to proceed with this booking? This action cannot be undone."
        confirmText="Confirm Booking"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </>
  );
};

export default BookingPaymentPage;
