// src/components/rent/TimeSelection.jsx

import React from "react";
import { useSelector } from "react-redux";

const TimeSelection = ({ selectedTime, onTimeSelect, selectedDate }) => {
  const { timeSlots, status } = useSelector((state) => state.availability);

  // Function to check if time slot is in the past
  const isTimeSlotInPast = (timeString) => {
    const now = new Date();

    // If selected date is today, check against current time
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      if (selectedDateStr === today) {
        // Create a Date object for the time slot today
        const timeSlotDate = new Date(`${today}T${timeString}:00`);
        return timeSlotDate < now;
      }
    }

    // If it's a future date, no time slots are in the past
    return false;
  };

  // Function to generate 30-minute interval slots
  const generate30MinuteSlots = () => {
    const slots = [];
    const startHour = 10; // Start from 10:00
    const endHour = 23; // End at 23:00

    for (let hour = startHour; hour <= endHour; hour++) {
      // Add full hour slot (e.g., 10:00, 11:00, etc.)
      const fullHour = hour.toString().padStart(2, '0') + ':00';
      slots.push({
        time: fullHour,
        is_available: true,
        is_generated: true
      });

      // Add 30-minute slot (e.g., 10:30, 11:30, etc.)
      // But exclude 23:30 as it's too close to closing time (24:00)
      if (hour < 23) {
        const halfHour = hour.toString().padStart(2, '0') + ':30';
        slots.push({
          time: halfHour,
          is_available: true,
          is_generated: true
        });
      }
    }

    return slots;
  };

  // Combine API slots with generated 30-minute slots
  const getAllTimeSlots = () => {
    const apiSlots = timeSlots || [];
    const generatedSlots = generate30MinuteSlots();

    // Create a map of existing API slots
    const apiSlotsMap = new Map();
    apiSlots.forEach(slot => {
      apiSlotsMap.set(slot.time, slot);
    });

    // Combine slots, prioritizing API slots
    const combinedSlots = generatedSlots.map(generatedSlot => {
      const apiSlot = apiSlotsMap.get(generatedSlot.time);
      if (apiSlot) {
        return apiSlot; // Use API slot if available
      }
      return generatedSlot; // Use generated slot if no API slot
    });

    return combinedSlots;
  };

  if (status === "loading") {
    return (
      <div className="text-center mt-8">
        <span className="loading loading-dots loading-md"></span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {status === "loading" && (
          <div className="flex items-center justify-center mb-4 p-3 bg-blue-50 rounded-lg ">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">Loading time slots...</span>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg w-full mx-auto">
          {getAllTimeSlots().map((slot) => {
            const isPastTime = isTimeSlotInPast(slot.time);
            const isDisabled = !slot.is_available || isPastTime;

            return (
              <button
                key={slot.time}
                onClick={() => onTimeSelect(slot.time)}
                disabled={isDisabled}
                className={`btn normal-case font-semibold transition-all duration-200
                  ${selectedTime === slot.time
                    ? "bg-brand-gold text-white border-brand-gold"
                    : "bg-transparent border-gray-300 text-black hover:border-brand-gold"
                  }
                  ${isDisabled
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                    : ""
                  }
                  ${slot.is_generated && slot.is_available ? "border-dashed" : ""}
                `}
                title={isPastTime ? "Waktu ini sudah lewat" : slot.is_generated ? "Slot 30 menit" : ""}
              >
                {slot.time}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <div className="flex flex-col items-center gap-2 text-xs text-black">
            <p>*Default booking duration is <span className="font-bold">1 hour</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSelection;
