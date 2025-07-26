import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { changePasswordSchema } from "../../features/auth/authValidation";
import { updateProfileThunk } from "../../features/auth/authSlice";

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const validationResult = changePasswordSchema.safeParse(formData);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      toast.error(Object.values(formattedErrors)[0][0]);
      return;
    }

    dispatch(updateProfileThunk(validationResult.data))
      .unwrap()
      .then(() => {
        toast.success("Password updated successfully!");
        setFormData({ password: "", password_confirmation: "" });
      })
      .catch((error) => {
        toast.error(error || "Failed to update password.");
      });
  };

  return (
    <div className="w-full max-w-2xl bg-base-100 p-8 rounded-lg shadow-lg border-2 border-brand-gold/20 mt-8">
      <h2 className="text-3xl font-minecraft text-brand-gold mb-8">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">New Password*</span>
          </label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`input input-bordered w-full pl-12 pr-10 focus:border-brand-gold focus:ring-brand-gold ${
                errors.password ? "input-error" : ""
              }`}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <span className="text-error text-xs mt-1">
                {errors.password?.[0]}
              </span>
            )}
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Confirm New Password*
            </span>
          </label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm new password"
              className={`input input-bordered w-full pl-12 pr-10 focus:border-brand-gold focus:ring-brand-gold ${
                errors.password_confirmation ? "input-error" : ""
              }`}
            />
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password_confirmation && (
              <span className="text-error text-xs mt-1">
                {errors.password_confirmation?.[0]}
              </span>
            )}
          </div>
        </div>

        {/* Tombol Save Changes */}
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

export default ChangePasswordForm;
