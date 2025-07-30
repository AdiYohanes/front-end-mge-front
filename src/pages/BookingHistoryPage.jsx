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
  const bookingDate = format(new Date(booking.start_time), "dd MMMM yyyy");
  const bookingTime = `${format(
    new Date(booking.start_time),
    "HH:mm"
  )} - ${format(new Date(booking.end_time), "HH:mm")}`;
  const fnbItems = booking.fnbs
    .map((fnb) => fnb?.name ? `${fnb.name} (x${fnb.pivot?.quantity || 0})` : '')
    .filter(item => item !== '')
    .join(", ");

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-200">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <FaGamepad className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{booking.unit?.name || 'Unknown Unit'}</h3>
            <p className="text-sm text-gray-500">
              {bookingDate}, {bookingTime}
            </p>
            {fnbItems && (
              <p className="text-xs text-gray-400 mt-1">Plus: {fnbItems}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <p className="font-bold text-lg">
            Rp{parseInt(booking.total_price).toLocaleString("id-ID")}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(booking.id)}
              className="btn btn-sm btn-ghost"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

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
      if (booking.status === "confirmed") {
        active.push(booking);
      } else {
        past.push(booking);
      }
    });
    return { activeBookings: active, pastBookings: past };
  }, [bookings, searchQuery]);

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
                  <a>Newest</a>
                </li>
                <li>
                  <a>Oldest</a>
                </li>
              </ul>
            </div>
          </div>

          {status === "loading" && (
            <span className="loading loading-spinner loading-lg"></span>
          )}
          {status === "succeeded" && currentBookings.length === 0 && (
            <div className="text-center p-10 bg-base-200 rounded-lg">
              <p className="font-semibold">
                {searchQuery
                  ? "No bookings found for your search."
                  : activeTab === "active"
                    ? "No active bookings found."
                    : "No past bookings found."}
              </p>
            </div>
          )}
          {status === "succeeded" && currentBookings.length > 0 && (
            <div className="space-y-6 text-left">
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
