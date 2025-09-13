// src/components/common/HeroSlider.jsx

import React, { useState, useEffect } from "react";
// KOREKSI: Selalu import dari 'react-router-dom' untuk aplikasi web
import { Link } from "react-router";
import { FaRegMoneyBillAlt, FaGamepad } from "react-icons/fa";

// Daftar gambar untuk slider
const images = [
  "/images/banner-1.png",
  "/images/banner-2.png",
  "/images/banner-3.png",
];

// 1. Komponen sekarang menerima prop 'onPricelistClick' dari HomePage
const HeroSlider = ({ onPricelistClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect untuk menjalankan slider otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[845px] overflow-hidden">
      {/* Container untuk gambar-gambar slider */}
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      {/* Lapisan overlay gelap */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>

      {/* Konten teks dan tombol di tengah */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 py-8 sm:px-6 lg:px-8 ">
        {/* Title Section - Perfectly Centered */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-8 md:mb-16 lg:mb-20 ">
          <h1 className="font-minecraft text-shadow-lg leading-[0.8] text-center">
            <span className="block text-5xl xs:text-6xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[200px]">
              Medan Gaming
            </span>
            <span className="block text-5xl xs:text-6xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[200px]">
              Ecosystem
            </span>
          </h1>
        </div>

        {/* Buttons Section - Moved Down */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 w-full max-w-sm sm:max-w-md lg:max-w-lg mt-4 sm:mt-6">
          {/* Pricelist Button */}
          <button
            onClick={onPricelistClick}
            className="w-[180px] sm:w-[200px] lg:w-[220px] flex items-center justify-center text-base sm:text-base lg:text-lg xl:text-xl px-8 py-3 sm:px-10 sm:py-4 lg:px-12 lg:py-5 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg cursor-pointer"
          >
            <FaRegMoneyBillAlt className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 flex-shrink-0" />
            <span className="whitespace-nowrap">Pricelist</span>
          </button>

          {/* Book a Room Button */}
          <Link
            to="/rent"
            className="w-[200px] sm:w-[220px] lg:w-[240px] flex items-center justify-center text-base sm:text-base lg:text-lg xl:text-xl px-8 py-3 sm:px-10 sm:py-4 lg:px-12 lg:py-5 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
          >
            <FaGamepad className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 flex-shrink-0" />
            <span className="whitespace-nowrap">Book a Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
