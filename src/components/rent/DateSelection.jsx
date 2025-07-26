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
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-lg bg-base-100 p-6 rounded-lg shadow-lg border border-base-200">
        <h3 className="text-3xl font-minecraft text-center mb-6">
          Select Date
        </h3>
        {status === "loading" && (
          <p className="text-center text-sm mb-2">Checking availability...</p>
        )}
        <Calendar
          onChange={onDateSelect}
          value={selectedDate}
          minDate={new Date()}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveMonth(activeStartDate)
          }
          tileDisabled={isDateDisabled}
        />
      </div>
    </div>
  );
};

export default DateSelection;
