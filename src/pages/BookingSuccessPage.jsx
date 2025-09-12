import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaHistory, FaPlusCircle, FaGift } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { clearBookingState } from "../features/booking/bookingSlice";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const invoiceNumber = queryParams.get("invoice_number");

  // Get booking state from Redux
  const { status: bookingStatus, invoiceNumber: reduxInvoiceNumber, bookingData } = useSelector((state) => state.booking);

  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isRewardBooking, setIsRewardBooking] = useState(false);
  const [isOtsBooking, setIsOtsBooking] = useState(false);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [, setShouldBlock] = useState(false);

  useEffect(() => {
    const validateAccess = () => {
      // Check if this is a direct Midtrans redirect
      const urlParams = new URLSearchParams(location.search);
      const transactionStatus = urlParams.get('transaction_status');
      const orderId = urlParams.get('order_id');
      const statusCode = urlParams.get('status_code');

      console.log("BookingSuccessPage - URL parameters:", {
        transactionStatus,
        orderId,
        statusCode,
        invoiceNumber,
        currentUrl: window.location.href
      });

      console.log("BookingSuccessPage - Location state:", {
        isReward: location.state?.isReward,
        isOts: location.state?.isOts,
        isGuestBooking: location.state?.isGuestBooking,
        paymentCompleted: location.state?.paymentCompleted
      });

      console.log("BookingSuccessPage - Booking data from Redux:", {
        bookingData: bookingData,
        hasData: !!bookingData?.data,
        points_earned: bookingData?.data?.points_earned,
        total_booking_hours: bookingData?.data?.total_booking_hours,
        points_per_hour: bookingData?.data?.unit?.points_per_hour,
        unit: bookingData?.data?.unit,
        bookable: bookingData?.data?.bookable
      });

      // If this is a Midtrans redirect, validate the transaction status
      if (transactionStatus) {
        if (['settlement', 'capture', 'success', 'pending'].includes(transactionStatus.toLowerCase())) {
          console.log("BookingSuccessPage - Valid Midtrans success redirect detected");
          // This is a valid success redirect from Midtrans
          setShouldBlock(false);
        } else {
          console.log("BookingSuccessPage - Invalid transaction status, redirecting to cancelled page");
          // Invalid status, redirect to cancelled page
          navigate('/booking-cancelled', {
            state: {
              paymentCancelled: true,
              transactionStatus: transactionStatus,
              orderId: orderId
            }
          });
          return;
        }
      }

      // Check if this is a reward booking
      const isReward = location.state?.isReward === true;
      setIsRewardBooking(isReward);

      // Check if this is an OTS booking
      const isOts = location.state?.isOts === true;
      setIsOtsBooking(isOts);

      // Check if this is a guest booking
      const isGuest = location.state?.isGuestBooking === true;
      setIsGuestBooking(isGuest);

      // Get booking details from location state if available
      if (location.state?.bookingDetails) {
        setBookingDetails(location.state.bookingDetails);
      }

      // Clear the session marker after successful access (if exists)
      if (sessionStorage.getItem("recentBookingComplete") === "true") {
        sessionStorage.removeItem("recentBookingComplete");
      }

      // Clear booking state after 30 seconds to prevent future unauthorized access
      // but allow enough time for user to view the page
      setTimeout(() => {
        dispatch(clearBookingState());
      }, 30000);

      setIsLoading(false);
    };

    // Small delay to ensure Redux state is loaded
    const timer = setTimeout(validateAccess, 100);
    return () => clearTimeout(timer);
  }, [invoiceNumber, reduxInvoiceNumber, bookingStatus, bookingData, location.state, location.search, navigate, dispatch]);

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


  // Use fallback invoice number if needed
  const displayInvoiceNumber = invoiceNumber || reduxInvoiceNumber || "BOOK-UNKNOWN";

  // Calculate points based on booking type and API response
  const calculatePoints = () => {
    console.log("BookingSuccessPage - calculatePoints called:", {
      isRewardBooking,
      isOtsBooking,
      isGuestBooking,
      bookingData: bookingData?.data,
      points_earned: bookingData?.data?.points_earned,
      bookingDetails: bookingDetails
    });

    if (isRewardBooking || isOtsBooking || isGuestBooking) {
      console.log("BookingSuccessPage - No points for reward/OTS/guest booking");
      return 0; // No points for reward bookings, OTS bookings, or guest bookings
    }

    // Use points_earned from booking API response if available
    if (bookingData?.data?.points_earned !== undefined) {
      console.log("BookingSuccessPage - Using points from API response:", {
        points_earned: bookingData.data.points_earned,
        bookingData: bookingData.data
      });
      return bookingData.data.points_earned;
    }

    // Fallback to bookingDetails if API data not available
    if (bookingDetails?.duration) {
      console.log("BookingSuccessPage - Using fallback calculation:", {
        duration: bookingDetails.duration,
        calculatedPoints: Math.floor(bookingDetails.duration)
      });
      // 1 point per hour of booking (fallback)
      return Math.floor(bookingDetails.duration);
    }

    console.log("BookingSuccessPage - No points data available");
    return 0; // No points if no data available
  };

  const earnedPoints = calculatePoints();

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        {/* 1. Gambar Sukses (Logo) lebih besar */}
        <img
          src="/images/success.png"
          alt="Success"
          className="h-48 w-auto mx-auto mb-4" // Ukuran diperbesar
        />

        {/* 2. Reward Booking Banner */}
        {isRewardBooking && (
          <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <FaGift className="h-12 w-12 text-green-600" />
            <div className="text-left">
              <p className="text-green-600 text-sm font-medium">Reward Booking</p>
              <p className="text-xl font-bold text-green-700">Free Booking Applied!</p>
            </div>
          </div>
        )}

        {/* 2. OTS Booking Banner */}
        {isOtsBooking && (
          <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-4xl">🏪</div>
            <div className="text-left">
              <p className="text-blue-600 text-sm font-medium">OTS Booking</p>
              <p className="text-xl font-bold text-blue-700">Over The Counter Booking</p>
            </div>
          </div>
        )}

        {/* 3. Points Section - Show for normal bookings (logged in users only) */}
        {!isRewardBooking && !isOtsBooking && !isGuestBooking && (
          <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <img
              src="/images/coin.png"
              alt="Points Earned"
              className="h-12 w-auto"
            />
            <div className="text-left">
              <p className="text-gray-500 text-sm">You've earned</p>
              <p className="text-2xl font-bold text-brand-gold">{earnedPoints} Points</p>
              {bookingData?.data?.unit?.points_per_hour && (
                <p className="text-xs text-gray-400">
                  ({bookingData.data.unit.points_per_hour} points per hour)
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. Tulisan Sukses */}
        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-800 mb-4">
          {invoiceNumber ? "Your booking has been made!" : "Booking Confirmation"}
        </h1>

        {/* 5. Teks Konfirmasi */}
        <p className="max-w-md mx-auto text-gray-600 leading-relaxed mb-8">
          {invoiceNumber ? (
            isRewardBooking
              ? "Your reward booking has been confirmed! We will send you a confirmation through Whatsapp. Please sit tight!"
              : isOtsBooking
                ? "Your OTS booking has been confirmed! Payment will be processed at the counter. We will send you a confirmation through Whatsapp. Please sit tight!"
                : "We will send you a confirmation and payment information through Whatsapp. Please sit tight!"
          ) : (
            "This is a booking confirmation page. If you have a valid booking, please contact our support team for assistance."
          )}
        </p>

        {/* 4. Booking Details */}
        {bookingDetails && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg w-full max-w-md">
            <h3 className="font-minecraft text-lg text-brand-gold mb-4">Booking Details</h3>
            <div className="space-y-2 text-left">
              {bookingDetails.psUnit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-semibold">{bookingDetails.psUnit.name}</span>
                </div>
              )}
              {bookingDetails.selectedGames?.[0] && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Game:</span>
                  <span className="font-semibold">{bookingDetails.selectedGames[0].name}</span>
                </div>
              )}
              {bookingDetails.date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {new Date(bookingDetails.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {bookingDetails.startTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{bookingDetails.startTime}</span>
                </div>
              )}
              {bookingDetails.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{bookingDetails.duration} hours</span>
                </div>
              )}
              {bookingDetails.numberOfPeople && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-semibold">{bookingDetails.numberOfPeople} people</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Nomor Invoice */}
        <div className="mb-10 p-4 bg-base-200 rounded-lg inline-block">
          <span className="text-gray-500 text-sm">Invoice Number:</span>
          <p className="font-semibold text-lg tracking-wider">
            {displayInvoiceNumber}
          </p>
        </div>

        {/* Public Access Information */}
        {!invoiceNumber && (
          <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <h3 className="font-minecraft text-lg text-blue-800 mb-3">Need Help?</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Email:</strong> support@gamingrental.com</p>
              <p><strong>Phone:</strong> +62 812-3456-7890</p>
              <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
            </div>
          </div>
        )}

        {/* 6. Tombol Aksi */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
          {isGuestBooking ? (
            // Guest booking - only show back to home button
            <Link to="/" className="btn bg-brand-gold text-white w-full">
              <FaPlusCircle className="mr-2" />
              Back to Home
            </Link>
          ) : (
            // Logged in user - show both buttons
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
