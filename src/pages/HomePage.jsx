// src/pages/HomePage.jsx

import React, { useRef } from "react";

// Import semua section komponen
import HeroSlider from "../components/common/HeroSlider";
import TaglineSection from "../components/common/TaglineSection";
import ConsolesSection from "../components/common/ConsolesSection";
import GamesSection from "../components/common/GamesSection";
import RoomsSection from "../components/common/RoomsSection";
import PricelistSection from "../components/common/PricelistSection";
import CustomerReviewSection from "../components/common/CustomerReviewSection";

const HomePage = () => {
  // 1. Buat sebuah 'ref' untuk menargetkan PricelistSection
  const pricelistRef = useRef(null);

  // 2. Buat fungsi yang akan melakukan scroll
  const handleScrollToPricelist = () => {
    // Memerintahkan browser untuk scroll ke elemen yang ditandai oleh ref
    pricelistRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* 3. Kirim fungsi scroll sebagai prop ke HeroSlider */}
      <HeroSlider onPricelistClick={handleScrollToPricelist} />

      {/* Susun sisa section secara berurutan */}
      <TaglineSection />
      <ConsolesSection />
      <GamesSection />
      <RoomsSection />

      {/* 4. Pasang 'ref' pada komponen PricelistSection */}
      <PricelistSection ref={pricelistRef} />

      <CustomerReviewSection />
    </div>
  );
};

export default HomePage;
