// src/components/history/RescheduleModal.jsx

import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/Calendar.css";
import publicApiClient from "../../lib/publicApiClient";

const RescheduleModal = ({ booking, onClose, onReschedule }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(3);
  const [reason, setReason] = useState("Sudden urgent");
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedDates, setBookedDates] = useState({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Time slots available
  const allTimeSlots = [
    "09.00", "10.00", "11.00", "12.00", "13.00", "14.00",
    "15.00", "16.00", "17.00", "18.00", "19.00", "20.00"
  ];

  // Duration options
  const durationOptions = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if (booking) {
      // Set default values from current booking
      const currentDate = new Date(booking.start_time);
      setSelectedDate(currentDate);
      setSelectedTime(format(currentDate, "HH.mm"));

      // Calculate duration from start and end time
      const endTime = new Date(booking.end_time);
      const durationHours = Math.round((endTime - currentDate) / (1000 * 60 * 60));
      setDuration(durationHours);

      // Fetch availability for current month
      fetchDayAvailability(currentDate);
    }
  }, [booking]);

  // Fetch day availability
  const fetchDayAvailability = async (date) => {
    if (!booking?.unit?.id) return;

    setIsLoadingAvailability(true);
    try {
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const response = await publicApiClient.post(`/api/public/get-availability-day/${booking.unit.id}`, {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd")
      });

      const data = response.data;
      const bookedDatesMap = {};
      data.forEach(item => {
        bookedDatesMap[item.date] = item.is_fully_booked;
      });
      setBookedDates(bookedDatesMap);
    } catch (error) {
      console.error('Error fetching day availability:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Fetch time availability
  const fetchTimeAvailability = async (date) => {
    if (!booking?.unit?.id || !date) return;

    setIsLoadingTimeSlots(true);
    try {
      const response = await publicApiClient.post(`/api/public/get-availability-time/${booking.unit.id}`, {
        date: format(date, "yyyy-MM-dd")
      });

      const data = response.data;
      setAvailableTimeSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching time availability:', error);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Check if date is disabled
  const isDateDisabled = ({ date, view }) => {
    if (view === "month") {
      const dateString = format(date, "yyyy-MM-dd");
      return bookedDates[dateString] === true;
    }
    return false;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setSelectedTime(""); // Reset time when date changes
    fetchTimeAvailability(date);
  };

  // Check if time and duration combination is available
  const isTimeAndDurationAvailable = (time) => {
    if (!selectedDate || !time) return false;

    const startTime = time.replace(".", ":");
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = startTime.split(":");
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check if all time slots within duration are available
    for (let i = 0; i < duration; i++) {
      const checkTime = new Date(startDateTime.getTime() + i * 60 * 60 * 1000);
      const checkTimeString = format(checkTime, "HH:mm");
      const timeSlot = availableTimeSlots.find(slot => slot.time === checkTimeString);

      if (!timeSlot || !timeSlot.is_available) {
        return false;
      }
    }

    return true;
  };

  // Handle duration change
  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    // Clear selected time if it's no longer valid with new duration
    if (selectedTime && !isTimeAndDurationAvailable(selectedTime)) {
      setSelectedTime("");
    }
  };

  if (!booking) return null;

  const originalDate = format(new Date(booking.start_time), "eeee, do MMMM yyyy");
  const originalTime = `${format(new Date(booking.start_time), "HH.mm")} - ${format(new Date(booking.end_time), "HH.mm")}`;

  const newDate = selectedDate ? format(selectedDate, "eeee, do MMMM yyyy") : "Select date";
  const newTime = selectedTime && selectedDate ? `${selectedTime} - ${format(new Date(selectedDate.getTime() + duration * 60 * 60 * 1000), "HH.mm")}` : "Select time";

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time");
      return;
    }

    const rescheduleData = {
      new_date: format(selectedDate, "yyyy-MM-dd"),
      new_start_time: selectedTime.replace(".", ":"),
      duration: duration,
      reason: reason
    };

    onReschedule(rescheduleData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-200">
          <h3 className="font-minecraft text-2xl text-brand-gold">
            Reschedule Booking
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Unit Information */}
          <div className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/20 p-2 rounded-md">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{booking.unit.name}</h4>
                <p className="text-sm text-gray-600">
                  {booking.unit.console?.name || "Console information not available"}
                </p>
                {booking.games && booking.games.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Game: {booking.games[0].title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Comparison */}
          <div className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Original Booking</p>
              <p className="font-semibold">{originalDate}</p>
              <p className="text-sm">{originalTime}</p>
            </div>
            <div className="text-2xl text-brand-gold">→</div>
            <div className="text-center">
              <p className="text-sm text-gray-600">New Booking</p>
              <p className="font-semibold">{newDate}</p>
              <p className="text-sm">{newTime}</p>
            </div>
          </div>

          {/* Change Booking Day */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Change Booking Day
            </label>
            {isLoadingAvailability && (
              <p className="text-xs text-gray-500 mb-2">Checking availability...</p>
            )}
            <div className="relative">
              <input
                type="text"
                value={selectedDate ? format(selectedDate, "eeee, do MMMM yyyy") : ""}
                onClick={() => setShowCalendar(!showCalendar)}
                readOnly
                className="input input-bordered w-full cursor-pointer"
                placeholder="Select date"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {showCalendar && (
              <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg">
                <Calendar
                  onChange={handleDateSelect}
                  value={selectedDate}
                  minDate={new Date()}
                  className="border-0"
                  tileDisabled={isDateDisabled}
                  onActiveStartDateChange={({ activeStartDate }) => {
                    if (activeStartDate) {
                      fetchDayAvailability(activeStartDate);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Start Booking Hour */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Start Booking Hour
            </label>
            {isLoadingTimeSlots && (
              <p className="text-xs text-gray-500 mb-2">Loading available time slots...</p>
            )}
            <div className="grid grid-cols-4 gap-2">
              {allTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={isLoadingTimeSlots || !isTimeAndDurationAvailable(time)}
                  className={`btn btn-sm ${selectedTime === time
                    ? "bg-brand-gold text-white border-brand-gold"
                    : "btn-outline border-gray-300"
                    } ${isLoadingTimeSlots || !isTimeAndDurationAvailable(time) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              *Default booking duration is 1 hour.
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Duration
            </label>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                className="select select-bordered w-full"
              >
                {durationOptions.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Reason of rescheduling
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter reason for rescheduling"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-200 flex justify-end">
          <button
            onClick={handleReschedule}
            className="btn bg-brand-gold hover:bg-brand-gold/80 text-white"
          >
            Reschedule Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
