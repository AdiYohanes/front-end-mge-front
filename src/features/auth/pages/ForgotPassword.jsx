// src/features/auth/pages/ForgotPassword.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { requestResetTokenThunk } from "../authSlice";
import { forgotPasswordSchema } from "../authValidation";
import { MdPhone, MdArrowBack, MdCheckCircle } from "react-icons/md";

const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { status, error: apiError } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const handleRequestToken = (e) => {
    e.preventDefault();
    setErrors({});

    const validationResult = forgotPasswordSchema.safeParse({ phone });
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      toast.error(formattedErrors.phone[0]);
      return;
    }

    dispatch(requestResetTokenThunk(validationResult.data))
      .unwrap()
      .then(() => {
        setIsSuccess(true);
      })
      // Error akan ditangani oleh useEffect di bawah
      .catch(() => {});
  };

  useEffect(() => {
    if (status === "failed" && apiError) {
      toast.error(apiError);
    }
  }, [status, apiError]);

  if (isSuccess) {
    return (
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <MdCheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
          <h1 className="text-3xl font-minecraft text-brand-gold mb-4">
            Check Your Whatsapp
          </h1>
          <p className="text-gray-600 mb-2">
            We've sent a password reset link to:
          </p>
          <p className="font-semibold text-brand-gold mb-6">{phone}</p>
          <Link to="/login" className="btn bg-brand-gold text-white w-full">
            <MdArrowBack className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md shadow-2xl bg-base-100">
      <form className="card-body p-8" onSubmit={handleRequestToken}>
        <h1 className="text-3xl font-minecraft text-center mb-4 text-brand-gold">
          Forgot Password
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter the phone number associated with your account.
        </p>
        <div className="form-control">
          <label className="label" htmlFor="phone">
            <span className="label-text">
              Phone Number<span className="text-red-500">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              placeholder="e.g., 081234567890"
              className={`input input-bordered w-full pl-10 ${
                errors.phone ? "input-error" : ""
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.phone && (
            <span className="text-error text-xs mt-1">{errors.phone[0]}</span>
          )}
        </div>
        <div className="form-control mt-6">
          <button
            type="submit"
            className={`btn bg-brand-gold text-white w-full ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
        <div className="text-center mt-4">
          <Link to="/login" className="link link-hover text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
