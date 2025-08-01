// src/pages/ProfilePage.jsx

import React from "react";
import { useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaGamepad, FaPhone } from "react-icons/fa";
import PersonalInfoDisplay from "../components/profile/PersonalInfoDisplay";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const userPoints = user?.total_points || 0;

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex flex-col items-center">
      {/* Bagian Atas: Judul & Poin */}
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-5xl lg:text-6xl font-minecraft mb-8">
          <span>Edit </span>
          <span className="text-brand-gold">Profile</span>
        </h1>
        <div className="flex items-center gap-3 mb-4 justify-center">
          <img src="/images/coin.png" alt="Points" className="h-8 w-auto" />
          <span className="text-2xl font-bold text-brand-gold">
            {userPoints} points
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          Want to redeem your points? Ask the MGE Staff near you!
        </p>
        <div className="flex items-center gap-3 justify-center">
          <div className="h-3 w-3 bg-black"></div>
          <div className="h-3 w-3 bg-brand-gold"></div>
          <div className="h-3 w-3 bg-black"></div>
        </div>
      </div>

      {/* Bagian Bawah: Form Personal Information */}
      <PersonalInfoDisplay />

      {/* Bagian Bawahnya Lagi: Form Change Password */}
      <ChangePasswordForm />
    </div>
  );
};

export default ProfilePage;
