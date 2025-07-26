// src/components/rent/TimeSelection.jsx

import React from "react";
import { useSelector } from "react-redux";

const TimeSelection = ({ selectedTime, onTimeSelect }) => {
  const { timeSlots, status } = useSelector((state) => state.availability);

  if (status === "loading") {
    return (
      <div className="text-center mt-8">
        <span className="loading loading-dots loading-md"></span>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full flex flex-col items-center">
      <h3 className="text-2xl font-minecraft text-gray-700 mb-6">Start Time</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg w-full">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onTimeSelect(slot.time)}
            disabled={!slot.is_available}
            className={`btn normal-case font-semibold transition-all duration-200
              ${
                selectedTime === slot.time
                  ? "bg-brand-gold text-white border-brand-gold"
                  : "bg-transparent border-gray-300 text-gray-700 hover:border-brand-gold"
              }
              ${
                !slot.is_available
                  ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                  : ""
              }
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        *Default booking duration is <span className="font-bold">1 hour</span>.
      </p>
    </div>
  );
};

export default TimeSelection;
