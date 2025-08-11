// src/components/rent/DateSelection.jsx

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useDispatch, useSelector } from "react-redux";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fetchAvailabilityThunk } from "../../features/availability/availabilitySlice";
import "react-calendar/dist/Calendar.css";
import "../../styles/Calendar.css";

const DateSelection = ({ unitId, selectedDate, onDateSelect }) => {
  const [activeMonth, setActiveMonth] = useState(new Date());

  const dispatch = useDispatch();
  const { bookedDates, status } = useSelector((state) => state.availability);

  useEffect(() => {
    if (unitId) {
      const startDate = startOfMonth(activeMonth);
      const endDate = endOfMonth(activeMonth);
      dispatch(fetchAvailabilityThunk({ unitId, startDate, endDate }));
    }
  }, [unitId, activeMonth, dispatch]);

  const isDateDisabled = ({ date, view }) => {
    if (view === "month") {
      const dateString = format(date, "yyyy-MM-dd");
      return bookedDates[dateString] === true;
    }
    return false;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-minecraft text-black mb-2">
            📅 Select Date
          </h3>
          <p className="text-sm text-black">
            Choose your preferred booking date
          </p>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">Checking availability...</span>
          </div>
        )}

        <div className="calendar-container">
          <Calendar
            onChange={onDateSelect}
            value={selectedDate}
            minDate={new Date()}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveMonth(activeStartDate)
            }
            tileDisabled={isDateDisabled}
            className="custom-calendar"
          />
        </div>
      </div>
    </div>
  );
};

export default DateSelection;
