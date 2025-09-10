// src/components/rent/PersonalInfoForm.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaUser, FaPhone } from "react-icons/fa";
import TermsModal from "../common/TermsModal";

// Terima props: formData, onFormChange, useLoginInfo, onUseLoginInfoChange, isGuestBooking
const PersonalInfoForm = ({
  formData,
  onFormChange,
  useLoginInfo,
  onUseLoginInfoChange,
  isGuestBooking = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Removed automatic form data update - now handled by parent component
  // useEffect(() => {
  //   // Gunakan onFormChange untuk memperbarui state di induk
  //   if (useLoginInfo && user) {
  //     onFormChange({ target: { name: "fullName", value: user.name || "" } });
  //     onFormChange({
  //       target: { name: "phoneNumber", value: user.phone || "" },
  //     });
  //   } else if (!useLoginInfo) {
  //     onFormChange({ target: { name: "fullName", value: "" } });
  //     onFormChange({ target: { name: "phoneNumber", value: "" } });
  //   }
  // }, [useLoginInfo, user, onFormChange]);

  // Handler untuk Terms Modal
  const handleTermsAccept = () => {
    onFormChange({ target: { name: "agreed", type: "checkbox", checked: true } });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-1 text-left">
        Personal Information
      </h2>
      <p className="text-sm text-gray-600 mb-6 text-left">
        Please provide your name and phone number.
      </p>

      {/* Checkbox "Use my account information" - Hidden for guest booking */}
      {!isGuestBooking && (
        <div
          className={`mb-6 p-3 rounded-md border ${user
            ? "bg-yellow-50 border-brand-gold/30"
            : "bg-gray-50 border-gray-200"
            }`}
        >
          <label
            className={`flex items-center gap-3 ${user ? "cursor-pointer" : "cursor-not-allowed"
              }`}
          >
            <input
              type="checkbox"
              className={`w-4 h-4 rounded focus:ring-2 ${user
                ? "text-brand-gold focus:ring-brand-gold/50"
                : "text-gray-400 focus:ring-gray-300"
                }`}
              checked={useLoginInfo}
              onChange={(e) => {
                console.log("PersonalInfoForm - Checkbox onChange:", { checked: e.target.checked, user: !!user });
                onUseLoginInfoChange(e.target.checked);
              }}
              disabled={!user}
            />
            <div>
              <span
                className={`text-sm font-medium ${user ? "text-gray-900" : "text-gray-500"
                  }`}
              >
                Use my account information
              </span>
              {!user && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Please login to use this feature
                </p>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
            Full Name *
          </label>
          <div className="relative">
            <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${useLoginInfo ? 'text-gray-300' : 'text-gray-400'}`} />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onFormChange}
              disabled={useLoginInfo}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm outline-none ${useLoginInfo
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-black'
                } placeholder:text-gray-500`}
              placeholder={useLoginInfo ? "Using account information" : "Enter your full name"}
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
            Phone Number *
          </label>
          <div className="relative">
            <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${useLoginInfo ? 'text-gray-300' : 'text-gray-400'}`} />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => {
                // Only allow numbers and limit to 14 characters
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 14);
                onFormChange({ target: { name: 'phoneNumber', value } });
              }}
              disabled={useLoginInfo}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm outline-none ${useLoginInfo
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-black'
                } placeholder:text-gray-500`}
              placeholder={useLoginInfo ? "Using account information" : "Enter your phone number (numbers only)"}
              maxLength={14}
              required
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="pt-3 border-t border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreed"
              checked={formData.agreed}
              onChange={(e) => {
                if (e.target.checked) {
                  setShowTermsModal(true);
                } else {
                  onFormChange({ target: { name: "agreed", type: "checkbox", checked: false } });
                }
              }}
              className="w-4 h-4 text-brand-gold rounded focus:ring-brand-gold mt-0.5"
              required
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-brand-gold hover:underline font-medium"
              >
                Terms & Conditions
              </button>
              .
            </span>
          </label>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
};

export default PersonalInfoForm;
