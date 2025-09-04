// src/features/auth/pages/ResetPassword.jsx

import React, { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { resetPasswordSchema } from "../authValidation";
import { MdLock, MdArrowBack, MdCheckCircle } from "react-icons/md";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = { password, confirmPassword };
    const validationResult = resetPasswordSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      const firstError = Object.values(formattedErrors)[0]?.[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
    } catch (error) {
      toast.error("Failed to reset password. The link may have expired.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            Password Reset!
          </h1>
          <p className="text-gray-600 mb-8">
            Your password has been reset. You can now log in.
          </p>
          <Link to="/login" className="btn bg-brand-gold text-white w-full">
            <MdArrowBack className="w-4 h-4 mr-2" />
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md shadow-2xl bg-base-100">
      <form className="card-body p-8" onSubmit={handleResetPassword}>
        <h1 className="text-3xl font-minecraft text-brand-gold text-center mb-4 ">
          New Password
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Please create a new, strong password.
        </p>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text">
                New Password<span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              className={`input input-bordered w-full ${errors.password ? "input-error" : ""
                }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="text-error text-xs mt-1">
                {errors.password[0]}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text">
                Confirm New Password<span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""
                }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="text-error text-xs mt-1">
                {errors.confirmPassword[0]}
              </span>
            )}
          </div>
        </div>
        <div className="form-control mt-6">
          <button
            type="submit"
            className="btn bg-brand-gold text-white w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? "Saving..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
