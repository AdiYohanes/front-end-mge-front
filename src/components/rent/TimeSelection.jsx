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
      const halfHour = hour.toString().padStart(2, '0') + ':30';
      slots.push({
        time: halfHour,
        is_available: true,
        is_generated: true
      });
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
    <div className="mt-8 w-full flex flex-col items-center">
      <h3 className="text-2xl font-minecraft text-theme-primary mb-6">Start Time</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg w-full">
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
                  : "bg-transparent border-theme text-theme-primary hover:border-brand-gold"
                }
                ${isDisabled
                  ? "bg-theme-tertiary text-theme-muted border-theme cursor-not-allowed line-through"
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
      <div className="text-xs text-theme-secondary mt-4 space-y-1">
        <p>*Default booking duration is <span className="font-bold">1 hour</span>.</p>
        <p className="text-blue-500">
          📅 Time slots tersedia setiap 30 menit (10:00, 10:30, 11:00, 11:30, dst.)
        </p>
        <p className="text-red-500">
          ⚠️ Time slots yang sudah lewat akan otomatis di-disable
        </p>
      </div>
    </div>
  );
};

export default TimeSelection;
