// src/components/rent/PersonalInfoForm.jsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

// Terima props: formData, onFormChange, useLoginInfo, onUseLoginInfoChange
const PersonalInfoForm = ({
  formData,
  onFormChange,
  useLoginInfo,
  onUseLoginInfoChange,
}) => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Gunakan onFormChange untuk memperbarui state di induk
    if (useLoginInfo && user) {
      onFormChange({ target: { name: "fullName", value: user.name || "" } });
      onFormChange({ target: { name: "email", value: user.email || "" } });
      onFormChange({
        target: { name: "phoneNumber", value: user.phone || "" },
      });
    } else if (!useLoginInfo) {
      onFormChange({ target: { name: "fullName", value: "" } });
      onFormChange({ target: { name: "email", value: "" } });
      onFormChange({ target: { name: "phoneNumber", value: "" } });
    }
  }, [useLoginInfo, user, onFormChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Personal Information
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Please provide your contact details.
      </p>

      {/* Checkbox "Use my account information" */}
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
            onChange={(e) => onUseLoginInfoChange(e.target.checked)}
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

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onFormChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-black placeholder:text-gray-500"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onFormChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-black placeholder:text-gray-500"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onFormChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-black placeholder:text-gray-500"
              placeholder="Enter your phone number"
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
              onChange={onFormChange}
              className="w-4 h-4 text-brand-gold rounded focus:ring-brand-gold mt-0.5"
              required
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I agree to the{" "}
              <a
                href="/terms"
                className="text-brand-gold hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </a>
              .
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
