import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaHistory, FaPlusCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { clearBookingState } from "../features/booking/bookingSlice";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const invoiceNumber = queryParams.get("invoice_number");

  // Get booking state from Redux
  const { status: bookingStatus, invoiceNumber: reduxInvoiceNumber } = useSelector((state) => state.booking);

  // Local state for access validation
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAccess = () => {

      // Check multiple validation criteria
      const hasValidInvoice = invoiceNumber && invoiceNumber.trim() !== "";
      const hasReduxInvoice = reduxInvoiceNumber && reduxInvoiceNumber.trim() !== "";
      const hasSuccessfulBooking = bookingStatus === "succeeded";
      const hasPaymentCompletedFlag = location.state?.paymentCompleted === true;
      const hasRecentBookingSession = sessionStorage.getItem("recentBookingComplete") === "true";

      // Validate invoice number match (if both exist)
      const invoiceMatches = !hasReduxInvoice || !hasValidInvoice || invoiceNumber === reduxInvoiceNumber;

      const isAccessValid = (
        (hasValidInvoice && hasSuccessfulBooking && invoiceMatches) ||
        hasPaymentCompletedFlag ||
        hasRecentBookingSession ||
        (hasValidInvoice && hasReduxInvoice && invoiceMatches)
      );


      if (isAccessValid) {
        setIsValidAccess(true);
        // Clear the session marker after successful access
        sessionStorage.removeItem("recentBookingComplete");

        // Clear booking state after 30 seconds to prevent future unauthorized access
        // but allow enough time for user to view the page
        setTimeout(() => {
          dispatch(clearBookingState());
        }, 30000);
      } else {
        // Redirect to home with warning message
        navigate("/", {
          replace: true,
          state: {
            message: "Access to booking confirmation requires a recent booking.",
            type: "warning"
          }
        });
        return;
      }

      setIsLoading(false);
    };

    // Small delay to ensure Redux state is loaded
    const timer = setTimeout(validateAccess, 100);
    return () => clearTimeout(timer);
  }, [invoiceNumber, reduxInvoiceNumber, bookingStatus, location.state, navigate]);

  // Show loading while validating
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
        <div className="w-full max-w-2xl text-center flex flex-col items-center">
          <div className="loading loading-spinner loading-lg text-brand-gold"></div>
          <p className="mt-4 text-gray-600">Verifying booking...</p>
        </div>
      </div>
    );
  }

  // Show error if access is not valid (shouldn't reach here due to redirect, but just in case)
  if (!isValidAccess) {
    return (
      <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
        <div className="w-full max-w-2xl text-center flex flex-col items-center">
          <div className="text-error text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">This page can only be accessed after completing a booking.</p>
          <Link to="/" className="btn bg-brand-gold text-white">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Use fallback invoice number if needed
  const displayInvoiceNumber = invoiceNumber || reduxInvoiceNumber || "BOOK-UNKNOWN";

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        {/* 1. Gambar Sukses (Logo) lebih besar */}
        <img
          src="/images/success.png"
          alt="Success"
          className="h-48 w-auto mx-auto mb-4" // Ukuran diperbesar
        />

        {/* 2. Gambar & Poin sekarang di bawah logo */}
        <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <img
            src="/images/coin.png"
            alt="Points Earned"
            className="h-12 w-auto"
          />
          <div className="text-left">
            <p className="text-gray-500 text-sm">You've earned</p>
            <p className="text-2xl font-bold text-brand-gold">10 Points</p>
          </div>
        </div>

        {/* 3. Tulisan Sukses */}
        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-800 mb-4">
          Your booking has been made!
        </h1>

        {/* 5. Teks Konfirmasi */}
        <p className="max-w-md mx-auto text-gray-600 leading-relaxed mb-8">
          We will send you a confirmation and payment information through
          Whatsapp. Please sit tight!
        </p>

        {/* 4. Nomor Invoice */}
        <div className="mb-10 p-4 bg-base-200 rounded-lg inline-block">
          <span className="text-gray-500 text-sm">Invoice Number:</span>
          <p className="font-semibold text-lg tracking-wider">
            {displayInvoiceNumber}
          </p>
        </div>

        {/* 6. Tombol Aksi */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
          <Link
            to="/history"
            className="btn btn-outline border-gray-300 w-full"
          >
            <FaHistory className="mr-2" />
            See booking history
          </Link>
          <Link to="/rent" className="btn bg-brand-gold text-white w-full">
            <FaPlusCircle className="mr-2" />
            Book another Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
