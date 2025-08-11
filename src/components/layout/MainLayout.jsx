// src/components/layout/MainLayout.jsx (Versi Baru)

import React from "react";
import { Outlet } from "react-router";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import useScrollToTop from "../../utils/useScrollToTop";

const MainLayout = () => {
  // Hook untuk scroll ke atas setiap kali route berubah
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main sekarang menjadi full-width */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
