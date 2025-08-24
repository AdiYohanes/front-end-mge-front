// src/features/auth/pages/VerificationPage.jsx

import React, { useState, useEffect } from "react";
import OtpInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { resendTokenThunk, verifyOTPThunk } from "../authSlice"; // Import thunk resend dan verify

const VerificationPage = () => {
  const [otp, setOtp] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Ambil nomor telepon dan status dari Redux state
  const { registrationPhone, status, error } = useSelector((state) => state.auth);

  // Loading state berdasarkan status Redux
  const isLoading = status === "loading";

  // Log untuk debugging
  console.log("Verification page - Phone number from Redux:", registrationPhone);

  // Redirect jika tidak ada nomor telepon
  useEffect(() => {
    if (!registrationPhone) {
      toast.error("Phone number not found. Please register again.");
      setTimeout(() => {
        navigate("/register");
      }, 2000);
    }
  }, [registrationPhone, navigate]);

  // Handle verification result
  useEffect(() => {
    console.log("Verification status changed:", { status, error });

    if (status === "succeeded" && !error) {
      console.log("Verification successful, redirecting to login...");
      toast.success("Verification successful! Please login to continue.");
      setTimeout(() => {
        console.log("Navigating to /login");
        navigate("/login");
      }, 1500);
    } else if (status === "failed" && error) {
      console.error("Verification error:", error);
      toast.error(error || "Verification failed. Please try again.");
    }
  }, [status, error, navigate]);

  // Jika tidak ada nomor telepon, tampilkan loading
  if (!registrationPhone) {
    return (
      <div className="card w-full max-w-lg shadow-2xl bg-base-100">
        <div className="card-body p-8 sm:p-10 text-center">
          <div className="loading loading-spinner loading-lg text-brand-gold"></div>
          <p className="mt-4 text-gray-600">Redirecting to registration...</p>
        </div>
      </div>
    );
  }

  const handleConfirm = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the complete OTP code.");
      return;
    }

    console.log(`Verifying OTP: ${otp} for phone: ${registrationPhone}`);

    // Dispatch verify OTP thunk dengan payload yang benar
    const payload = {
      phone: registrationPhone,
      token: otp
    };
    console.log("Sending verification request with payload:", payload);

    dispatch(verifyOTPThunk(payload))
      .unwrap()
      .then((result) => {
        console.log("Verification thunk successful:", result);
      })
      .catch((error) => {
        console.error("Verification thunk failed:", error);
      });
  };

  // Fungsi baru untuk menangani Resend OTP
  const handleResendOtp = () => {
    if (!registrationPhone) {
      toast.error("Phone number not found. Please register again.");
      return;
    }

    console.log("Resending OTP to:", registrationPhone);

    // Dispatch thunk dan tangani hasilnya untuk menampilkan toast
    dispatch(resendTokenThunk(registrationPhone))
      .unwrap()
      .then((message) => {
        toast.success(message || "OTP has been resent successfully!");
      })
      .catch((errorMessage) => {
        console.error("Resend OTP error:", errorMessage);
        toast.error(errorMessage || "Failed to resend OTP. Please try again.");
      });
  };

  return (
    <div className="card w-full max-w-lg shadow-2xl bg-base-100">
      <form className="card-body p-8 sm:p-10" onSubmit={handleConfirm}>
        <h1 className="text-4xl font-minecraft text-center mb-4 text-brand-gold">
          Input Verification
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          We've sent you an OTP code to your{" "}
          <span className="font-semibold text-success">WhatsApp</span> for a
          verification.
        </p>

        {registrationPhone && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Phone number: <span className="font-semibold text-brand-gold">{registrationPhone}</span>
            </p>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">OTP Code</span>
          </label>
        </div>

        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderInput={(props) => (
            <input
              {...props}
              className="!w-10 sm:!w-12 h-10 sm:h-12 text-center text-lg font-bold border-2 border-base-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              disabled={isLoading}
            />
          )}
          containerStyle="flex justify-between gap-1"
        />

        <div className="text-right mt-2">
          <button
            type="button"
            onClick={handleResendOtp}
            className="btn btn-link btn-xs normal-case text-primary"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Resend OTP?"}
          </button>
        </div>

        <div className="form-control mt-6">
          <button
            type="submit"
            className={`btn bg-brand-gold text-white font-funnel tracking-widest btn-sm w-full ${isLoading ? "loading" : ""
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationPage;
