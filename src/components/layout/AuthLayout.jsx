import React, { useEffect, useRef } from "react";
import { Outlet, Link } from "react-router";
import { gsap } from "gsap";
import useScrollToTop from "../../utils/useScrollToTop";

const AuthLayout = () => {
  const imageUrl = "/images/authbanner.png";

  // Hook untuk scroll ke atas setiap kali route berubah
  useScrollToTop();

  // Ref untuk menampung elemen yang akan dianimasikan
  const decorationRef = useRef(null);

  // Gunakan useEffect untuk menjalankan animasi setelah komponen ter-render
  useEffect(() => {
    // Pastikan elemen sudah ada
    if (decorationRef.current) {
      // 'decorationRef.current.children' akan menargetkan semua kotak di dalamnya
      const boxes = decorationRef.current.children;

      // Animasi GSAP
      gsap.to(boxes, {
        rotation: 360, // Berputar 360 derajat
        duration: 3, // Durasi satu putaran (dalam detik)
        ease: "bounce.inOut",
        repeat: -1, // Ulangi tanpa henti
        stagger: 0.5, // Beri jeda 0.5 detik antar animasi setiap kotak
      });
    }

    // Fungsi cleanup (best practice)
    return () => {
      if (decorationRef.current) {
        // Hentikan animasi pada elemen ini jika komponen di-unmount
        gsap.killTweensOf(decorationRef.current.children);
      }
    };
  }, []); // [] dependency array kosong agar efek ini hanya berjalan sekali

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Kolom Kiri: Tempat Form Login/Register */}
      {/* 'relative' penting untuk positioning elemen di dalamnya */}
      <div className="relative flex flex-col items-center justify-center p-8">
        {/* ==================================================== */}
        {/* BACKGROUND & OVERLAY KHUSUS UNTUK TAMPILAN MOBILE */}
        {/* ==================================================== */}
        <div
          className="absolute inset-0 bg-cover bg-center lg:hidden" // Tampil di mobile, hilang di desktop
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          {/* Lapisan overlay gelap untuk meningkatkan keterbacaan */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        {/* ==================================================== */}
        {/* KONTEN (LOGO, DEKORASI, FORM)                      */}
        {/* Diberi z-10 agar berada di atas background mobile  */}
        {/* ==================================================== */}

        {/* Logo di Pojok Kiri Atas */}
        <div className="absolute top-8 left-8 z-10">
          <Link to="/">
            <img src="/images/logo.png" alt="Logo" className="w-32" />
          </Link>
        </div>

        {/* Dekorasi di Tengah Atas */}
        <div
          ref={decorationRef}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10"
        >
          <div
            className="h-3 w-3 bg-yellow-500"
            style={{ backgroundColor: "#D4AF37" }}
          ></div>
          <div
            className="h-3 w-3 bg-black"
            style={{ backgroundColor: "#000000" }}
          ></div>
          <div
            className="h-3 w-3 bg-yellow-500"
            style={{ backgroundColor: "#D4AF37" }}
          ></div>
        </div>

        {/* Wadah untuk konten utama (form) */}
        <div className="flex justify-center w-full z-10">
          <Outlet />
        </div>
      </div>

      {/* ==================================================== */}
      {/* Kolom Kanan: GAMBAR KHUSUS UNTUK TAMPILAN DESKTOP   */}
      {/* ==================================================== */}
      <div
        className="hidden lg:block bg-cover bg-center" // Hilang di mobile, tampil di desktop
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    </div>
  );
};

export default AuthLayout;
