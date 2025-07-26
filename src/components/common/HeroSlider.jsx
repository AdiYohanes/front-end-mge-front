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
    <div className="relative w-full h-[550px] lg:h-[845px] overflow-hidden">
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
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-4">
        <h1 className="text-5xl md:text-9xl font-minecraft text-shadow-lg mb-4">
          Medan Gaming Ecosystem
        </h1>
        <p className="text-lg md:text-2xl font-minecraft mb-8">
          Make Good Enough
        </p>
        <div className="flex flex-col gap-4">
          {/* 2. Diubah dari <Link> menjadi <button> */}
          {/* 'to' dihapus, 'onClick' ditambahkan */}
          <button
            onClick={onPricelistClick}
            className="text-base btn bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black"
          >
            <FaRegMoneyBillAlt className="mr-2 h-5 w-5" />
            Pricelist
          </button>

          {/* Tombol "Book a Room" tetap sebagai Link navigasi */}
          <Link
            to="/book"
            className="text-base btn bg-brand-gold text-white font-funnel tracking-wider hover:bg-white hover:text-black"
          >
            <MdPhoneAndroid className="mr-2 h-5 w-5" />
            Book a Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
