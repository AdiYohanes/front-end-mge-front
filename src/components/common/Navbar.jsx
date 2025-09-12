// src/components/common/Navbar.jsx

import React from "react";
// KOREKSI: Import dari 'react-router-dom' untuk aplikasi web
import { Link, NavLink, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = (
    <>
      <li>
        <NavLink to="/" className="text-base font-minecraft text-theme-primary hover:text-brand-gold">
          Medan Gaming Ecosystem
        </NavLink>
      </li>
      <li>
        <NavLink to="/rent" className="text-base font-minecraft text-theme-primary hover:text-brand-gold">
          Room
        </NavLink>
      </li>
      <li>
        <NavLink to="/food-drinks" className="text-base font-minecraft text-theme-primary hover:text-brand-gold">
          Food & Drinks
        </NavLink>
      </li>
      <li>
        <NavLink to="/faq" className="text-base font-minecraft text-theme-primary hover:text-brand-gold">
          FAQ
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="bg-theme-primary shadow-md sticky top-0 z-50 border-b border-theme">
      <div className="navbar container mx-auto">
        <div className="navbar-start">
          {/* Dropdown untuk Tampilan Mobile */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden rounded hover:bg-theme-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-theme-primary rounded-box w-52 border border-theme"
            >
              {/* LOGO BARU UNTUK TAMPILAN MOBILE - diletakkan di dalam dropdown */}
              <li className="mb-2">
                <Link
                  to="/"
                  className="btn btn-ghost justify-start h-auto py-2 hover:bg-theme-secondary"
                >
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="h-8 w-auto"
                  />
                </Link>
              </li>
              <div className="divider my-0"></div>
              {menuItems}
            </ul>
          </div>

          {/* LOGO UNTUK TAMPILAN DESKTOP (lg) - disembunyikan di mobile */}
          <Link
            to="/"
            className="btn btn-ghost normal-case text-xl hidden lg:flex rounded hover:bg-theme-secondary"
          >
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">{menuItems}</ul>
        </div>

        <div className="navbar-end">
          <ThemeToggle />
          <div className="divider divider-horizontal mx-2"></div>
          {token ? (
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn bg-brand-gold hover:bg-yellow-600 text-white rounded border-2 border-white flex items-center gap-2"
              >
                <img
                  src="/images/button-icon.png"
                  alt="user"
                  className="h-6 w-6"
                />
                <span className="font-minecraft tracking-widest">
                  {user?.name || "User"}
                </span>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-theme-primary rounded-box w-52 border border-theme"
              >
                <li className="p-2 font-semibold text-theme-primary">
                  Hi, {user?.name || "User"}
                </li>
                <div className="divider my-0"></div>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>{" "}
                <li>
                  <Link to="/book-history">Booking History</Link>
                </li>
                <li>
                  <Link to="/profile-rewards">Rewards</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn bg-brand-gold hover:bg-yellow-600 text-white rounded border-2 border-white"
            >
              <img
                src="/images/button-icon.png"
                alt="login"
                className="h-6 w-6 mr-2"
              />
              <span className="font-minecraft tracking-widest">Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
