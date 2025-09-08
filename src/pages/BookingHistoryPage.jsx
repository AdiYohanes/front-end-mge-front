import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchHistoryThunk,
  fetchDetailThunk,
} from "../features/history/historySlice";
import BookingDetailModal from "../components/history/BookingDetailModal";
import { FaSearch, FaFilter, FaGamepad } from "react-icons/fa";
import { format } from "date-fns";

// Komponen untuk satu baris item booking
const BookingItem = ({ booking, onViewDetails }) => {
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-brand-gold/30 group">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isRoomBooking ? 'bg-blue-50' : 'bg-green-50'} group-hover:scale-105 transition-transform duration-200`}>
              <FaGamepad className={`h-6 w-6 ${isRoomBooking ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-1">{displayTitle}</h3>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusColor(booking.status)} font-medium px-3 py-1`}>
                  {getStatusText(booking.status)}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  {booking.invoice_number}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-gold mb-1">
              Rp{parseInt(booking.total_price).toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Date:</span>
              <span className="text-sm text-gray-900">{bookingDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Time:</span>
              <span className="text-sm text-gray-900">{bookingTime}</span>
            </div>
            {isRoomBooking && booking.unit && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Visitors:</span>
                <span className="text-sm text-gray-900">{booking.total_visitors || 1} person(s)</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {isRoomBooking && booking.unit?.consoles?.[0] && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Console:</span>
                <span className="text-sm text-gray-900">{booking.unit.consoles[0].name}</span>
              </div>
            )}
            {isRoomBooking && booking.game && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Game:</span>
                <span className="text-sm text-gray-900">{booking.game.title}</span>
              </div>
            )}
            {booking.payment_method && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Payment:</span>
                <span className="text-sm text-gray-900 capitalize">{booking.payment_method}</span>
              </div>
            )}
          </div>
        </div>

        {/* F&B Items Section */}
        {fnbItems && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Food & Drinks:</p>
            <p className="text-sm text-gray-600">{fnbItems}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => onViewDetails(booking.id)}
            className="btn btn-outline border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all duration-200 font-medium px-6"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");

  const dispatch = useDispatch();
  const { bookings, status, selectedBookingDetail } = useSelector(
    (state) => state.history
  );

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
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBookingDetail && <BookingDetailModal />}
    </>
  );
};

export default BookingHistoryPage;
