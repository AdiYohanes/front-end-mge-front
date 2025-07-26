// src/router/index.jsx

import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

// Layouts
import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";

// Auth Pages
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import HomePage from "../pages/HomePage";
// Main Pages (Placeholders)
import RentalPage from "../pages/RentalPage";
import RentPage from "../pages/RentPage";
import FoodPage from "../pages/FoodPage";
import FoodDrinksSuccessPage from "../pages/FoodDrinksSuccessPage";
import FaqPage from "../pages/FaqPage";

import GamesPage from "../pages/GamesPage";
import VerificationPage from "../features/auth/pages/VerificationPage";
import BookingPaymentPage from "../pages/BookingPaymentPage";
import BookingSuccessPage from "../pages/BookingSuccessPage";
import ProfilePage from "../pages/ProfilePage";
import BookingHistoryPage from "../pages/BookingHistoryPage";
import BookingCancelledPage from "../pages/BookingCancelledPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Rute Autentikasi */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* ================================== */}
        {/* Rute Utama dengan MainLayout     */}
        {/* ================================== */}
        <Route path="/" element={<MainLayout />}>
          {/* Ubah path index agar tidak duplikat dengan path MainLayout */}
          <Route index element={<HomePage />} />
          {/* TAMBAHKAN SEMUA RUTE BARU DI SINI */}
          <Route path="rental" element={<RentalPage />} />
          <Route path="rent" element={<RentPage />} />
          <Route path="booking-payment" element={<BookingPaymentPage />} />
          <Route path="booking-success" element={<BookingSuccessPage />} />
          <Route path="food-drinks" element={<FoodPage />} />
          <Route path="food-drinks/success" element={<FoodDrinksSuccessPage />} />
          <Route path="faq" element={<FaqPage />} />{" "}
          <Route path="profile" element={<ProfilePage />} />{" "}
          <Route path="book-history" element={<BookingHistoryPage />} />{" "}
          <Route path="booking-cancelled" element={<BookingCancelledPage />} />
          <Route path="games" element={<GamesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
