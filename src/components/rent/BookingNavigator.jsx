// src/components/rent/BookingNavigator.jsx

import React from "react";
import {
  FaGamepad,
  FaCouch,
  FaCalendarAlt,
  FaShoppingBasket,
  FaCheckCircle,
} from "react-icons/fa";

const steps = [
  {
    id: 1,
    name: "Consoles",
    icon: <FaGamepad />,
    activeIconUrl: "/images/consoles-navigator.png",
  },
  {
    id: 2,
    name: "Room Type",
    icon: <FaCouch />,
    activeIconUrl: "/images/rooms-navigator.png",
  },
  {
    id: 3,
    name: "Date & Time",
    icon: <FaCalendarAlt />,
    activeIconUrl: "/images/date-navigator.png",
  },
  {
    id: 4,
    name: "Food & Drinks",
    icon: <FaShoppingBasket />,
    activeIconUrl: "/images/food-navigator.png",
  },
];

const BookingNavigator = ({ currentStep, onStepClick, bookingDetails }) => {
  // Function to check if a step is accessible
  const isStepAccessible = (stepId) => {
    switch (stepId) {
      case 1:
        return true; // Step 1 is always accessible
      case 2:
        return bookingDetails.console !== null;
      case 3:
        return bookingDetails.console !== null &&
          bookingDetails.psUnit !== null &&
          bookingDetails.selectedGames.length > 0;
      case 4:
        return bookingDetails.console !== null &&
          bookingDetails.psUnit !== null &&
          bookingDetails.selectedGames.length > 0 &&
          bookingDetails.startTime !== null &&
          bookingDetails.duration > 0;
      default:
        return false;
    }
  };

  // Function to check if a step is completed
  const isStepCompleted = (stepId) => {
    switch (stepId) {
      case 1:
        return bookingDetails.console !== null;
      case 2:
        return bookingDetails.console !== null &&
          bookingDetails.psUnit !== null &&
          bookingDetails.selectedGames.length > 0;
      case 3:
        return bookingDetails.console !== null &&
          bookingDetails.psUnit !== null &&
          bookingDetails.selectedGames.length > 0 &&
          bookingDetails.startTime !== null &&
          bookingDetails.duration > 0;
      case 4:
        return currentStep > 4; // Step 4 is completed when we move past it
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-3xl mt-8">
      <div className="flex border-b-2 border-base-200">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = isStepCompleted(step.id);
          const isAccessible = isStepAccessible(step.id);
          const isDisabled = !isAccessible && !isActive;

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepClick(step.id)}
              disabled={isDisabled}
              className={`flex-1 p-4 transition-all duration-300 ease-in-out border-b-4
                ${isActive
                  ? "bg-brand-gold text-white border-brand-gold shadow-md -translate-y-1"
                  : isCompleted
                    ? "bg-transparent text-theme-primary border-transparent cursor-pointer"
                    : isDisabled
                      ? "bg-transparent text-gray-400 border-transparent cursor-not-allowed opacity-50"
                      : "bg-transparent text-theme-secondary border-transparent hover:bg-theme-secondary cursor-pointer"
                }
                ${index === 0 ? "rounded-tl-lg" : ""}
                ${index === steps.length - 1 ? "rounded-tr-lg" : ""}
              `}
            >
              <div className="flex items-center justify-center gap-3">
                {/* --- LOGIKA BARU UNTUK IKON --- */}
                {isActive ? (
                  <img
                    src={step.activeIconUrl}
                    alt={step.name}
                    className="h-6 w-6"
                  />
                ) : isCompleted ? (
                  <FaCheckCircle className="text-green-500 h-6 w-6" /> // Ikon checklist hijau
                ) : (
                  <span className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full text-xs font-bold">
                    0{step.id}
                  </span>
                )}
                <span
                  className={`font-semibold ${isActive ? "font-minecraft" : ""
                    }`}
                >
                  {step.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingNavigator;
