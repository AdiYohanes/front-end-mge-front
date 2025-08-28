// src/features/auth/pages/Register.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { register, setRegistrationPhone, resetStatus } from "../authSlice"; // pastikan resetStatus diimport
import { registerSchema } from "../authValidation"; // Import skema Zod

import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import TermsModal from "../../../components/common/TermsModal";

// Komponen helper untuk menampilkan error
const ErrorMessage = ({ errors, apiErrors, fieldName, className = "" }) => {
  const error = errors[fieldName] || apiErrors[fieldName];
  return error ? (
    <span className={`text-error text-xs mt-1 ${className}`}>
      {error[0]}
    </span>
  ) : null;
};

const Register = () => {
  // State lokal untuk semua field input
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk Terms Modal
  const [showTermsModal, setShowTermsModal] = useState(false);

  // State lokal khusus untuk error validasi dari Zod
  const [errors, setErrors] = useState({});
  // State untuk error dari API
  const [apiErrors, setApiErrors] = useState({});

  // Hooks untuk dispatch action, navigasi, dan mengambil state dari Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error: apiError } = useSelector((state) => state.auth);

  // isLoading sekarang sepenuhnya dikontrol oleh status dari Redux
  const isLoading = status === "loading";

  // Fungsi untuk mengkonversi error API ke format yang bisa ditampilkan di field
  const parseApiErrors = (errorMessage) => {
    const fieldErrors = {};

    if (typeof errorMessage === 'string') {
      // Parse error message seperti "fullName: error message; email: error message"
      const errorParts = errorMessage.split(';');

      errorParts.forEach(part => {
        const [field, message] = part.split(':').map(s => s.trim());
        if (field && message) {
          fieldErrors[field] = [message];
        }
      });
    }

    return fieldErrors;
  };

  // Fungsi untuk membersihkan error saat user mulai mengetik
  const handleInputChange = (field, value, setter) => {
    setter(value);
    // Bersihkan error untuk field ini
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (apiErrors[field]) {
      setApiErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handler untuk Terms Modal
  const handleTermsAccept = () => {
    setAgreed(true);
    // Bersihkan error untuk checkbox
    if (errors.agreed) {
      setErrors(prev => ({ ...prev, agreed: undefined }));
    }
    if (apiErrors.agreed) {
      setApiErrors(prev => ({ ...prev, agreed: undefined }));
    }
  };

  // Fungsi yang dijalankan saat form disubmit
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); // Bersihkan error validasi lama
    setApiErrors({}); // Bersihkan error API lama

    const formData = {
      fullName,
      username,
      email,
      phoneNumber,
      password,
      confirmPassword,
      agreed,
    };

    // Debug: Log form data
    console.log("Form data:", formData);

    // Validasi input menggunakan skema Zod
    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      const firstError = Object.values(formattedErrors)[0]?.[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    // Debug: Log validated data
    console.log("Validated data:", validationResult.data);

    // Simpan nomor telepon ke Redux state untuk digunakan di halaman verification
    dispatch(setRegistrationPhone(validationResult.data.phoneNumber));
    console.log("Phone number saved to Redux:", validationResult.data.phoneNumber);

    // Jika validasi berhasil, dispatch action 'register'
    dispatch(register(validationResult.data));
  };

  // useEffect untuk "bereaksi" terhadap perubahan state Redux
  useEffect(() => {
    // Jika status dari Redux adalah 'failed', tampilkan error dari API
    if (status === "failed" && apiError) {
      // Log error untuk debugging
      console.error("Registration error:", apiError);

      // Parse error API dan tampilkan di field yang sesuai
      const parsedErrors = parseApiErrors(apiError);
      setApiErrors(parsedErrors);

      // Tampilkan toast dengan error pertama
      const firstError = Object.values(parsedErrors)[0]?.[0];
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Registration failed. Please check your input and try again.");
      }
    }

    // Jika status dari Redux adalah 'succeeded' (artinya registrasi berhasil)
    if (status === "succeeded" && apiError === null) {
      console.log("Registration successful, redirecting to verification page...");
      toast.success("Registration successful! Please check your WhatsApp for OTP verification.");
      setTimeout(() => {
        navigate("/verification"); // Arahkan user ke halaman verification
        dispatch(resetStatus()); // Reset status agar tidak trigger ulang
      }, 1500);
    }
  }, [status, apiError, navigate]);

  return (
    <div className="card w-full max-w-md shadow-2xl bg-base-100">
      <form className="card-body p-6" onSubmit={handleRegister}>
        <h1 className="text-3xl md:text-5xl font-minecraft text-brand-gold text-center mb-4">
          Register
        </h1>

        <div className="space-y-1">
          {/* Full Name */}
          <div className="form-control">
            <label className="label py-1" htmlFor="fullName">
              <span className="label-text text-sm">Name<span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="ex: John Doe"
              className={`input input-sm input-bordered w-full ${errors.fullName || apiErrors.fullName ? "input-error" : ""
                }`}
              value={fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value, setFullName)}
              disabled={isLoading}
            />
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="fullName" />
          </div>

          {/* Username */}
          <div className="form-control">
            <label className="label py-1" htmlFor="username">
              <span className="label-text text-sm">
                Username<span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="ex: johndoe123"
              className={`input input-sm input-bordered w-full ${errors.username || apiErrors.username ? "input-error" : ""
                }`}
              value={username}
              onChange={(e) => handleInputChange("username", e.target.value, setUsername)}
              disabled={isLoading}
            />
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="username" />
          </div>

          {/* Email Address */}
          <div className="form-control">
            <label className="label py-1" htmlFor="email">
              <span className="label-text text-sm">
                Email <span className="text-gray-500">(Optional)</span>
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="ex: user@gmail.com (optional)"
              className={`input input-sm input-bordered w-full ${errors.email || apiErrors.email ? "input-error" : ""
                }`}
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
              disabled={isLoading}
            />
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="email" />
          </div>

          {/* Phone Number */}
          <div className="form-control">
            <label className="label py-1" htmlFor="phoneNumber">
              <span className="label-text text-sm">
                Phone Number<span className="text-red-500">*</span>
              </span>
            </label>
            <span className="text-xs text-gray-500 mb-1 px-1">
              Make sure this number is connected to Whatsapp
            </span>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="ex: 081234567890"
              className={`input input-sm input-bordered w-full ${errors.phoneNumber || apiErrors.phoneNumber ? "input-error" : ""}`}
              value={phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value.slice(0, 14), setPhoneNumber)}
              maxLength={14}
              disabled={isLoading}
              aria-label="Phone Number"
              tabIndex={0}
            />
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="phoneNumber" />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label py-1" htmlFor="password">
              <span className="label-text text-sm">
                Password<span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`input input-sm input-bordered w-full pr-10 ${errors.password || apiErrors.password ? "input-error" : ""
                  }`}
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="password" />
          </div>

          {/* Confirm Password */}
          <div className="form-control">
            <label className="label py-1" htmlFor="confirmPassword">
              <span className="label-text text-sm">
                Confirm Password<span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`input input-sm input-bordered w-full pr-10 ${errors.confirmPassword || apiErrors.confirmPassword ? "input-error" : ""
                  }`}
                value={confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
            <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="confirmPassword" />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="form-control mt-4">
          <label className="label cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="checkbox text-brand-gold rounded-none border-brand-gold checkbox-xs mt-1"
              checked={agreed}
              onChange={(e) => {
                if (e.target.checked) {
                  setShowTermsModal(true);
                } else {
                  setAgreed(false);
                }
                // Bersihkan error untuk checkbox
                if (errors.agreed) {
                  setErrors(prev => ({ ...prev, agreed: undefined }));
                }
                if (apiErrors.agreed) {
                  setApiErrors(prev => ({ ...prev, agreed: undefined }));
                }
              }}
              disabled={isLoading}
            />
            <div className="flex flex-col">
              <span className="label-text text-xs text-gray-600">
                By ticking, you are confirming that you have read, understood,
              </span>
              <span className="label-text text-xs text-gray-600">
                and agree to our{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="link text-brand-gold font-bold text-xs"
                >
                  Terms & Conditions
                </button>
              </span>
            </div>
          </label>
          <ErrorMessage errors={errors} apiErrors={apiErrors} fieldName="agreed" className="ml-9" />
        </div>

        {/* Action Buttons */}
        <div className="form-control mt-4 space-y-2">
          <button
            type="submit"
            className={`btn bg-brand-gold btn-sm w-full text-white font-funnel tracking-widest ${isLoading ? "loading" : ""
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-xs">
            Already have an account?{" "}
            <Link to="/login" className="link text-brand-gold font-semibold">
              Login
            </Link>
          </p>
        </div>
      </form>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
};

export default Register;
