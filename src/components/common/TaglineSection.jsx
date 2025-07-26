// src/components/common/TaglineSection.jsx

import React from "react";
// Import ikon-ikon yang kita butuhkan
import { BsTriangleFill, BsCircleFill, BsSquareFill } from "react-icons/bs";
import { ImCross } from "react-icons/im";

const TaglineSection = () => {
  return (
    <section className="bg-base-200 text-base-content py-20 lg:py-32 relative overflow-hidden">
      {/* Dekorasi Ikon di Latar Belakang */}
      <BsTriangleFill className="absolute -left-8 top-1/4 text-gray-200 text-8xl -rotate-12" />
      <BsCircleFill className="absolute -right-10 top-1/2 text-gray-200 text-9xl" />
      <ImCross className="absolute left-[15%] bottom-1/4 text-gray-200 text-7xl rotate-12" />
      <BsSquareFill className="absolute right-[20%] top-[15%] text-gray-200 text-6xl rotate-6" />

      {/* Konten Utama */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl lg:text-7xl font-minecraft mb-6">
          <span>Make </span>
          <span className="text-brand-gold">Good</span>
          <span> Enough</span>
        </h1>
        <p className="max-w-5xl text-lg lg:text-2xl leading-relaxed">
          Make Good Enough is a place for you to grab a PlayStation, dive into
          epic games, and play without limits—no commitments, just pure gaming
          joy!
        </p>

        <div className="flex items-center gap-5 mt-12">
          <div className="h-3 w-3 bg-black"></div>
          <div className="h-3 w-3 bg-brand-gold"></div>
          <div className="h-3 w-3 bg-black"></div>
        </div>
      </div>
    </section>
  );
};

export default TaglineSection;
