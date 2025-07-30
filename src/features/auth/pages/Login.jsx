import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { login } from "../authSlice";
import { loginSchema } from "../authValidation";

import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../components/common/ThemeProvider";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { status, error: apiError, token } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});

    const formData = { username, password };
    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      toast.error(Object.values(formattedErrors)[0]?.[0]);
      return;
    }

    dispatch(login(validationResult.data));
  };

  useEffect(() => {
    if (status === "failed" && apiError) {
      toast.error(apiError);
    }
    if (status === "succeeded" && token) {
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [status, apiError, token, navigate]);

  return (
    <div className="card w-full max-w-md shadow-2xl bg-white">
      <form className="card-body p-6" onSubmit={handleLogin}>
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle border-2 border-black dark:border-white hover:bg-gray-100"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === "light" ? (
              <FaMoon className="h-5 w-5 text-black" />
            ) : (
              <FaSun className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Diubah: text-primary -> text-brand-gold */}
        <h1 className="text-3xl md:text-7xl font-minecraft text-center mb-4 text-brand-gold">
          Login
        </h1>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label py-1" htmlFor="username">
              <span className="label-text text-sm text-black">
                Username<span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className={`input input-sm input-bordered w-full text-black ${errors.username ? "input-error" : ""
                }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            {errors.username && (
              <span className="text-error text-xs mt-1">
                {errors.username?.[0]}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label py-1" htmlFor="password">
              <span className="label-text text-sm text-black">
                Password<span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`input input-sm input-bordered w-full pr-10 text-black ${errors.password ? "input-error" : ""
                  }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-xs mt-1">
                {errors.password?.[0]}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-xs">
          <label className="label cursor-pointer gap-2">
            {/* Diubah: checkbox-primary -> accent-brand-gold */}
            <input
              type="checkbox"
              className="checkbox checkbox-xs accent-brand-gold"
            />
            <span className="label-text text-black">Remember me</span>
          </label>
          {/* Diubah: link-primary -> text-brand-gold */}
          <Link
            to="/forgot-password"
            className="link link-hover text-brand-gold"
          >
            Forgot password?
          </Link>
        </div>
        <div className="form-control mt-4 space-y-2">
          <button
            type="submit"
            // Diubah: btn-primary -> bg-brand-gold
            className={`btn bg-brand-gold hover:bg-yellow-600 border-none btn-sm w-full text-white font-minecraft tracking-wider ${isLoading ? "loading" : ""
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="divider text-xs my-1">or</div>
          {/* <button
            type="button"
            className="btn btn-sm btn-outline w-full flex items-center gap-2"
          >
            <FcGoogle size={20} />
            Sign in with Google
          </button> */}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-black">
            Don't have an account yet?{" "}
            {/* Diubah: link-primary -> text-brand-gold */}
            <Link to="/register" className="link text-brand-gold font-semibold">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
