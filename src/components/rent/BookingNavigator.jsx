// src/components/rent/BookingNavigator.jsx

import React from "react";
import {
  FaGamepad,
  FaCouch,
  FaCalendarAlt,
  FaShoppingBasket,
  FaCheckCircle,
  FaCreditCard,
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
    name: "Room",
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
    name: "Food",
    icon: <FaShoppingBasket />,
    activeIconUrl: "/images/food-navigator.png",
  },
  {
    id: 5,
    name: "Payment",
    icon: <FaCreditCard />,
    activeIconUrl: "/images/payment-navigator.png",
  },
];

const BookingNavigator = ({ currentStep, onStepClick, bookingDetails }) => {
  // Check if this is a reward booking
  const isRewardBooking = !!bookingDetails.rewardInfo;

  // Filter steps based on booking type
  const visibleSteps = isRewardBooking
    ? steps.filter(step => step.id !== 4) // Hide Food & Drinks for reward booking
    : steps; // Show all steps for normal booking

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
        // For reward booking, step 4 is not accessible
        if (isRewardBooking) return false;
        return bookingDetails.console !== null &&
          bookingDetails.psUnit !== null &&
          bookingDetails.selectedGames.length > 0 &&
          bookingDetails.startTime !== null &&
          bookingDetails.duration > 0;
      case 5:
        // Payment step is accessible after step 3 for reward booking, or step 4 for normal booking
        if (isRewardBooking) {
          return bookingDetails.console !== null &&
            bookingDetails.psUnit !== null &&
            bookingDetails.selectedGames.length > 0 &&
            bookingDetails.startTime !== null &&
            bookingDetails.duration > 0;
        } else {
          return bookingDetails.console !== null &&
            bookingDetails.psUnit !== null &&
            bookingDetails.selectedGames.length > 0 &&
            bookingDetails.startTime !== null &&
            bookingDetails.duration > 0 &&
            currentStep > 4; // Only accessible after F&B step
        }
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
        // For reward booking, step 4 is always completed (skipped)
        if (isRewardBooking) return true;
        return currentStep > 4; // Step 4 is completed when we move past it
      case 5:
        // Payment step is completed when we navigate to payment page
        return currentStep > 5;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-3xl mt-8">
      {/* Mobile: Vertical layout */}
      <div className="block sm:hidden">
        <div className="space-y-2">
          {visibleSteps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const isDisabled = !isAccessible && !isActive;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={isDisabled}
                className={`w-full p-3 transition-all duration-300 ease-in-out rounded-lg border-2 min-w-0
                  ${isActive
                    ? "bg-brand-gold text-white border-brand-gold shadow-md"
                    : isCompleted
                      ? "bg-green-50 text-green-700 border-green-200 cursor-pointer"
                      : isDisabled
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icons */}
                  {isActive ? (
                    <img
                      src={step.activeIconUrl}
                      alt={step.name}
                      className="h-5 w-5 flex-shrink-0"
                    />
                  ) : isCompleted ? (
                    <FaCheckCircle className="text-green-500 h-5 w-5 flex-shrink-0" />
                  ) : (
                    <span className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded-full text-xs font-bold flex-shrink-0 min-w-[20px] min-h-[20px]">
                      {step.id}
                    </span>
                  )}
                  <span
                    className={`font-semibold text-sm ${isActive ? "font-minecraft" : ""}`}
                  >
                    {step.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:block">
        <div className="flex border-b-2 border-base-200">
          {visibleSteps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const isDisabled = !isAccessible && !isActive;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={isDisabled}
                className={`flex-1 p-2 sm:p-4 transition-all duration-300 ease-in-out border-b-4 min-w-0
                  ${isActive
                    ? "bg-brand-gold text-white border-brand-gold shadow-md -translate-y-1"
                    : isCompleted
                      ? "bg-transparent text-theme-primary border-transparent cursor-pointer"
                      : isDisabled
                        ? "bg-transparent text-gray-400 border-transparent cursor-not-allowed opacity-50"
                        : "bg-transparent text-theme-secondary border-transparent hover:bg-theme-secondary cursor-pointer"
                  }
                  ${index === 0 ? "rounded-tl-lg" : ""}
                  ${index === visibleSteps.length - 1 ? "rounded-tr-lg" : ""}
                `}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0">
                  {/* Icons */}
                  {isActive ? (
                    <img
                      src={step.activeIconUrl}
                      alt={step.name}
                      className="h-6 w-6"
                    />
                  ) : isCompleted ? (
                    <FaCheckCircle className="text-green-500 h-6 w-6" />
                  ) : (
                    <span className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full text-xs font-bold min-w-[24px] min-h-[24px]">
                      0{step.id}
                    </span>
                  )}
                  <span
                    className={`font-semibold whitespace-nowrap text-sm sm:text-base ${isActive ? "font-minecraft" : ""
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
    </div>
  );
};

export default BookingNavigator;
