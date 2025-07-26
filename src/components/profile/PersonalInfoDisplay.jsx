// src/components/profile/PersonalInfoDisplay.jsx

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaGamepad, FaPhone } from "react-icons/fa";
import { updateProfileThunk } from "../../features/auth/authSlice"; // Pastikan thunk ini sudah ada

const PersonalInfoDisplay = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  // State untuk mengelola data form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phoneNumber: "",
  });

  // useEffect untuk mengisi form saat data user dari Redux tersedia
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        username: user.username || "",
        phoneNumber: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const changes = {};
    if (formData.fullName !== user.name) changes.name = formData.fullName;
    if (formData.email !== user.email) changes.email = formData.email;
    if (formData.username !== user.username)
      changes.username = formData.username;
    if (formData.phoneNumber !== user.phone)
      changes.phone = formData.phoneNumber;

    if (Object.keys(changes).length === 0) {
      toast("No changes to save.");
      return;
    }

    dispatch(updateProfileThunk(changes))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully!");
      })
      .catch((error) => {
        toast.error(error || "Failed to update profile.");
      });
  };

  return (
    <div className="w-full max-w-2xl bg-base-100 p-8 rounded-lg shadow-lg border-2 border-brand-gold/20 mt-12">
      <h2 className="text-3xl font-minecraft text-brand-gold mb-8">
        Personal Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Full Name*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="input input-bordered w-full focus:border-brand-gold focus:ring-brand-gold"
            required
          />
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Email*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full focus:border-brand-gold focus:ring-brand-gold"
            required
          />
        </div>

        {/* Username */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Username*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input input-bordered w-full focus:border-brand-gold focus:ring-brand-gold"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Phone Number*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input input-bordered w-full focus:border-brand-gold focus:ring-brand-gold"
            required
          />
        </div>

        {/* Tombol Save */}
        <div className="card-actions justify-end pt-4">
          <button
            type="submit"
            className={`btn bg-brand-gold text-white w-full sm:w-auto ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoDisplay;
