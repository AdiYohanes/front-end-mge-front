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
        <h1 className="font-minecraft text-shadow-lg mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-[0.9]">
          <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[180px]">
            Medan Gaming
          </span>
          <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[180px]">
            Ecosystem
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 lg:gap-6 mt-2 sm:mt-4 lg:mt-6 w-full max-w-xs sm:max-w-lg lg:max-w-xl">
          {/* Pricelist Button */}
          <button
            onClick={onPricelistClick}
            className="flex items-center justify-center text-xs sm:text-base lg:text-xl px-3 sm:px-6 lg:px-8 py-2 sm:py-4 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
          >
            <FaRegMoneyBillAlt className="mr-1 sm:mr-3 h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            <span className="whitespace-nowrap">Pricelist</span>
          </button>

          {/* Book a Room Button */}
          <Link
            to="/rent"
            className="flex items-center justify-center text-xs sm:text-base lg:text-xl px-3 sm:px-6 lg:px-8 py-2 sm:py-4 bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black border-none transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
          >
            <MdPhoneAndroid className="mr-1 sm:mr-3 h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            <span className="whitespace-nowrap">Book a Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
