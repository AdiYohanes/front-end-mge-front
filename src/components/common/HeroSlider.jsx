// src/components/common/HeroSlider.jsx

import React, { useState, useEffect } from "react";
// KOREKSI: Selalu import dari 'react-router-dom' untuk aplikasi web
import { Link } from "react-router";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { MdPhoneAndroid } from "react-icons/md";

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
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 py-8 sm:px-6 lg:px-8">
        {/* Title Section - Perfectly Centered */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h1 className="font-minecraft text-shadow-lg leading-[0.9] text-center">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[180px]">
              Medan Gaming
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[180px]">
              Ecosystem
            </span>
          </h1>
        </div>

        {/* Buttons Section - Perfectly Centered with Identical Sizes */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Pricelist Button */}
          <button
            onClick={onPricelistClick}
            className="w-[160px] sm:w-[180px] lg:w-[200px] flex items-center justify-center text-sm sm:text-base lg:text-lg xl:text-xl px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
          >
            <FaRegMoneyBillAlt className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            <span className="whitespace-nowrap">Pricelist</span>
          </button>

          {/* Book a Room Button */}
          <Link
            to="/rent"
            className="w-[160px] sm:w-[180px] lg:w-[200px] flex items-center justify-center text-sm sm:text-base lg:text-lg xl:text-xl px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
          >
            <MdPhoneAndroid className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            <span className="whitespace-nowrap">Book a Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
