// src/components/common/ConsolesSection.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsolesThunk } from "../../features/consoles/consolesSlice";

const ConsolesSection = () => {
  const dispatch = useDispatch();
  const { consoles, status, error } = useSelector((state) => state.consoles);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchConsolesThunk());
    }
  }, [dispatch, status]);

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    if (consoles.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % Math.max(consoles.length, 1)
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [consoles.length]);

  // Show only active consoles from API
  const availableConsoles = consoles.filter((consoleItem) => consoleItem.is_active);

  // Get console images for carousel (use same rule as ConsoleSelection.jsx)
  const consoleImages = availableConsoles.length > 0
    ? availableConsoles.map((console) =>
      console?.image ? `${imageBaseUrl}/${console.image}` : "/images/playstation.png"
    )
    : ["/images/playstation.png"];

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? consoleImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % consoleImages.length
    );
  };


  if (status === "loading") {
    return (
      <section className="bg-theme-primary py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-4 h-4 bg-brand-gold"></div>
            <h2 className="text-4xl lg:text-[96px] font-minecraft text-theme-primary">Consoles</h2>
            <div className="w-4 h-4 bg-brand-gold"></div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg text-brand-gold"></div>
          </div>
        </div>
      </section>
    );
  }

  if (status === "failed") {
    return (
      <section className="bg-theme-primary py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-4 h-4 bg-brand-gold"></div>
            <h2 className="text-4xl lg:text-[96px] font-minecraft text-theme-primary">Consoles</h2>
            <div className="w-4 h-4 bg-brand-gold"></div>
          </div>
          <div className="text-center text-red-500">
            <p>Failed to load consoles: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-theme-primary py-20 lg:py-24">
      <div className="container mx-auto px-4">
        {/* 1. Judul Section di Kiri Atas */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-4 h-4 bg-brand-gold"></div>
          <h2 className="text-4xl lg:text-[96px] font-minecraft text-theme-primary">Consoles</h2>
          <div className="w-4 h-4 bg-brand-gold"></div>
        </div>

        {/* 2. Layout Utama: Gambar Kiri, Console Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 3. Kolom Kiri: Carousel Gambar Console */}
          <div className="relative">
            {/* Carousel Container */}
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg shadow-xl overflow-hidden">
              {/* Console Images */}
              {consoleImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <img
                    src={imageUrl}
                    alt={`Console ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image: ${imageUrl}`);
                      e.target.src = "/images/playstation.png";
                    }}
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              {consoleImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {consoleImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {consoleImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex
                        ? 'bg-brand-gold'
                        : 'bg-white/50 hover:bg-white/70'
                        }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Kolom Kanan: Semua Console yang Tersedia */}
          <div className="space-y-10">
            {availableConsoles.map((consoleItem) => (
              <div key={consoleItem.id}>
                <h3 className="text-3xl lg:text-6xl font-minecraft text-brand-gold mb-3">
                  {consoleItem.name}
                </h3>
                <p className="text-theme-secondary leading-relaxed font-funnel">
                  {consoleItem.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Dekorasi Bawah Tengah */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-5">
            <div className="h-3 w-3 bg-black"></div>
            <div className="h-3 w-3 bg-brand-gold"></div>
            <div className="h-3 w-3 bg-black"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsolesSection;
