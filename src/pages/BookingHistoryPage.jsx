import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchHistoryThunk,
  fetchDetailThunk,
} from "../features/history/historySlice";
import BookingDetailModal from "../components/history/BookingDetailModal";
import { FaSearch, FaFilter, FaGamepad, FaTimes } from "react-icons/fa";
import { format } from "date-fns";
import apiClient from "../lib/axios";

// Komponen Modal Rating
const RatingModal = ({ isOpen, onClose, onRate, booking }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRating(0);
      setFeedback("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (!booking?.invoice_number) {
      toast.error("Invoice number not found!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/customer/customer-reviews", {
        invoice_number: booking.invoice_number,
        rating: rating,
        description: feedback
      });

      console.log("Review submitted successfully:", response.data);

      // Show success message
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Review Submitted Successfully!</p>
            <p className="text-sm text-gray-600">Thank you for your valuable feedback!</p>
          </div>
        </div>,
        {
          duration: 3000,
          style: {
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }
      );

      // Call the original onRate callback
      onRate(booking.id, rating, feedback);
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-none p-8 max-w-xl w-full mx-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-minecraft text-brand-gold mb-2">
            Rate your Experience with MGE!
          </h2>
        </div>

        {/* Stars Rating */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <img
                  src="/images/start-reveiw.png"
                  alt={`Star ${star}`}
                  className={`w-8 h-8 transition-opacity duration-200 ${star <= rating ? "opacity-100" : "opacity-30"
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Rating Value */}
        <div className="text-center mb-6">
          <span className="text-lg font-semibold text-gray-800">
            {rating}/5
          </span>
        </div>

        {/* Feedback Section */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-3">
            Let us know what's your feedback for our services below
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback means a lot for us!"
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
          />
        </div>

        {/* Rate Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-brand-gold hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              Submitting...
            </div>
          ) : (
            "Rate"
          )}
        </button>
      </div>
    </div>
  );
};

// Komponen untuk satu baris item booking
const BookingItem = ({ booking, onViewDetails, onRate, ratedBookings }) => {
  // Handle different booking types (room booking vs F&B only booking)
  const isRoomBooking = booking.unit_id && booking.start_time;

  const bookingDate = isRoomBooking
    ? format(new Date(booking.start_time), "dd MMMM yyyy")
    : format(new Date(booking.created_at), "dd MMMM yyyy");

  const bookingTime = isRoomBooking
    ? `${format(new Date(booking.start_time), "HH:mm")} - ${format(new Date(booking.end_time), "HH:mm")}`
    : "F&B Only Booking";

  const fnbItems = booking.fnbs
    .map((fnb) => fnb?.name ? `${fnb.name} (x${fnb.pivot?.quantity || 0})` : '')
    .filter(item => item !== '')
    .join(", ");

  const displayTitle = isRoomBooking
    ? booking.unit?.name || 'Unknown Unit'
    : 'Food & Drinks Order';

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      case 'completed': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:border-brand-gold/30 group">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isRoomBooking ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30'} group-hover:scale-105 transition-transform duration-200`}>
              <FaGamepad className={`h-6 w-6 ${isRoomBooking ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{displayTitle}</h3>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusColor(booking.status)} font-medium px-3 py-1`}>
                  {getStatusText(booking.status)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {booking.invoice_number}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-gold mb-1">
              Rp{parseInt(booking.total_price).toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Date:</span>
              <span className="text-sm text-gray-900 dark:text-white">{bookingDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Time:</span>
              <span className="text-sm text-gray-900 dark:text-white">{bookingTime}</span>
            </div>
            {isRoomBooking && booking.unit && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Visitors:</span>
                <span className="text-sm text-gray-900 dark:text-white">{booking.total_visitors || 1} person(s)</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {isRoomBooking && booking.unit?.consoles?.[0] && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Console:</span>
                <span className="text-sm text-gray-900 dark:text-white">{booking.unit.consoles[0].name}</span>
              </div>
            )}
            {isRoomBooking && booking.game && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Game:</span>
                <span className="text-sm text-gray-900 dark:text-white">{booking.game.title}</span>
              </div>
            )}
            {booking.payment_method && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment:</span>
                <span className="text-sm text-gray-900 dark:text-white capitalize">{booking.payment_method}</span>
              </div>
            )}
          </div>
        </div>

        {/* F&B Items Section */}
        {fnbItems && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food & Drinks:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{fnbItems}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onViewDetails(booking.id)}
            className="btn btn-outline border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all duration-200 font-medium px-6"
          >
            View Details
          </button>
          {booking.status === 'completed' && !ratedBookings.has(booking.id) && (
            <button
              onClick={() => onRate(booking)}
              className="btn btn-outline border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500 transition-all duration-200 font-medium px-6"
            >
              Rate
            </button>
          )}
          {booking.status === 'completed' && ratedBookings.has(booking.id) && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Rated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [ratingModal, setRatingModal] = useState({ isOpen: false, booking: null });
  const [ratedBookings, setRatedBookings] = useState(new Set());

  const dispatch = useDispatch();
  const { bookings, status, selectedBookingDetail } = useSelector(
    (state) => state.history
  );

  // Load rated bookings from localStorage
  useEffect(() => {
    const savedRatedBookings = localStorage.getItem('ratedBookings');
    if (savedRatedBookings) {
      setRatedBookings(new Set(JSON.parse(savedRatedBookings)));
    }
  }, []);

  // Save rated bookings to localStorage
  const saveRatedBookings = (ratedSet) => {
    localStorage.setItem('ratedBookings', JSON.stringify([...ratedSet]));
  };

  useEffect(() => {
    // Ambil data history hanya jika belum pernah diambil
    if (status === "idle") {
      dispatch(fetchHistoryThunk());
    }
  }, [status, dispatch]);

  const { activeBookings, pastBookings } = useMemo(() => {
    const active = [];
    const past = [];

    const searchedBookings = bookings.filter((booking) => {
      const query = searchQuery.toLowerCase();
      const unitName = booking.unit?.name?.toLowerCase() || '';
      const fnbNames = booking.fnbs
        .map((fnb) => fnb?.name?.toLowerCase() || '')
        .filter(name => name !== '')
        .join(" ") || '';
      return unitName.includes(query) || fnbNames.includes(query);
    });

    searchedBookings.forEach((booking) => {
      // Update status filtering based on new API response
      if (booking.status === "confirmed" || booking.status === "pending") {
        active.push(booking);
      } else {
        past.push(booking);
      }
    });

    // Sort bookings based on selected filter
    const sortBookings = (bookingsList) => {
      return [...bookingsList].sort((a, b) => {
        const dateA = new Date(a.start_time || a.created_at);
        const dateB = new Date(b.start_time || b.created_at);

        if (sortFilter === "newest") {
          return dateB - dateA; // Newest first (descending)
        } else {
          return dateA - dateB; // Oldest first (ascending)
        }
      });
    };

    return {
      activeBookings: sortBookings(active),
      pastBookings: sortBookings(past)
    };
  }, [bookings, searchQuery, sortFilter]);

  const currentBookings =
    activeTab === "active" ? activeBookings : pastBookings;

  const handleViewDetails = (bookingId) =>
    dispatch(fetchDetailThunk(bookingId));

  const handleRateClick = (booking) => {
    setRatingModal({ isOpen: true, booking });
  };

  const handleRateSubmit = (bookingId, rating, feedback) => {
    // Add booking to rated bookings
    const newRatedBookings = new Set([...ratedBookings, bookingId]);
    setRatedBookings(newRatedBookings);
    saveRatedBookings(newRatedBookings);

    console.log("Rating submitted:", { bookingId, rating, feedback });
    console.log("Rated bookings updated:", newRatedBookings);
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, booking: null });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center w-full max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-minecraft mb-4">
            <span className="text-black">Booking </span>
            <span className="text-brand-gold">History</span>
          </h1>
          <div className="flex items-center gap-3 justify-center mb-12">
            <div className="h-3 w-3 bg-brand-gold"></div>
            <div className="h-3 w-3 bg-black"></div>
            <div className="h-3 w-3 bg-brand-gold"></div>
          </div>
          <div className="tabs tabs-boxed justify-center bg-base-200 p-2 rounded-lg mb-8">
            <a
              className={`tab tab-lg flex-1 ${activeTab === "active"
                ? "tab-active bg-brand-gold text-white"
                : ""
                }`}
              onClick={() => setActiveTab("active")}
            >
              Active Booking
            </a>
            <a
              className={`tab tab-lg flex-1 ${activeTab === "past"
                ? "tab-active bg-brand-gold text-white"
                : ""
                }`}
              onClick={() => setActiveTab("past")}
            >
              Past Booking
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
            <label className="input input-bordered flex items-center gap-2 flex-grow">
              <input
                type="text"
                className="grow"
                placeholder="Find by room name or F&B..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="text-gray-400" />
            </label>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-outline w-full sm:w-auto">
                <FaFilter className="mr-2" />
                Filter
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
              >
                <li>
                  <a
                    onClick={() => setSortFilter("newest")}
                    className={sortFilter === "newest" ? "active" : ""}
                  >
                    Newest
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setSortFilter("oldest")}
                    className={sortFilter === "oldest" ? "active" : ""}
                  >
                    Oldest
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {status === "loading" && (
            <span className="loading loading-spinner loading-lg"></span>
          )}
          {status === "succeeded" && currentBookings.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery
                    ? "No bookings found"
                    : activeTab === "active"
                      ? "No active bookings"
                      : "No past bookings"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters."
                    : activeTab === "active"
                      ? "You don't have any active bookings at the moment."
                      : "You don't have any past bookings yet."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn btn-outline border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
          {status === "succeeded" && currentBookings.length > 0 && (
            <div className="space-y-4 text-left">
              {currentBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onRate={handleRateClick}
                  ratedBookings={ratedBookings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBookingDetail && <BookingDetailModal />}

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={handleCloseRatingModal}
        onRate={handleRateSubmit}
        booking={ratingModal.booking}
      />
    </>
  );
};

export default BookingHistoryPage;
