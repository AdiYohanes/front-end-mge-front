// src/components/common/TaglineSection.jsx

import React from "react";
// Import ikon-ikon yang kita butuhkan
import { BsTriangleFill, BsCircleFill, BsSquareFill } from "react-icons/bs";
import { ImCross } from "react-icons/im";

const TaglineSection = () => {
  return (
    <section className="bg-theme-secondary text-theme-primary py-20 lg:py-32 relative overflow-hidden">
      {/* Dekorasi Ikon di Latar Belakang */}
      <BsTriangleFill className="absolute -left-8 top-1/4 text-theme-muted text-8xl -rotate-12" />
      <BsCircleFill className="absolute -right-10 top-1/2 text-theme-muted text-9xl" />
      <ImCross className="absolute left-[15%] bottom-1/4 text-theme-muted text-7xl rotate-12" />
      <BsSquareFill className="absolute right-[20%] top-[15%] text-theme-muted text-6xl rotate-6" />

      {/* Konten Utama */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[120px] 2xl:text-[140px] font-minecraft mb-6">
          <span className="block">Never</span>
          <span className="block">Stop <span className="text-brand-gold">Playing!</span></span>
        </h1>
        <p className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl 2xl:text-2xl leading-relaxed text-theme-secondary flex items-center justify-center">
          Gaut? Mending Ngegame !<br />
          Yang Seru dan nyaman? Yaa cuma di MGE!
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
