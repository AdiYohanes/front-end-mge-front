// src/components/common/CustomerReviewSection.jsx

import React from "react";
// 1. Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import ikon untuk rating bintang dan kutipan
import { FaStar, FaQuoteLeft } from "react-icons/fa";

// Data ulasan pelanggan
const reviews = [
  {
    id: 1,
    name: 'Andi "Pro Player" Wijaya',
    avatarUrl: "/images/button-icon.png",
    rating: 5,
    reviewText:
      "Tempatnya nyaman banget, koleksi gamenya update terus. PS5-nya kenceng, gak ada lag sama sekali. Pasti balik lagi!",
  },
  {
    id: 2,
    name: 'Siti "Gamer Santai" Lestari',
    avatarUrl: "/images/button-icon.png",
    rating: 4,
    reviewText:
      "Suka sama VIP Room-nya, bisa sambil nonton Netflix. Snack dan minumannya juga enak-enak. Harganya worth it.",
  },
  {
    id: 3,
    name: 'Budi "Mabar" Santoso',
    avatarUrl: "/images/button-icon.png",
    rating: 5,
    reviewText:
      "Pilihan terbaik buat mabar bareng teman-teman. Ruangannya luas, sofanya empuk. Staff-nya juga ramah dan sangat membantu.",
  },
  {
    id: 4,
    name: 'Rina "Family Time" Hartono',
    avatarUrl: "/images/button-icon.png",
    rating: 5,
    reviewText:
      "Bawa anak-anak ke sini pas weekend, mereka senang banget ada Nintendo Switch. Tempatnya bersih dan aman. Recommended!",
  },
];

// Komponen kecil untuk menampilkan rating bintang
const StarRating = ({ rating }) => (
  <div className="flex gap-1 text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

const CustomerReviewSection = () => {
  return (
    <section className="bg-base-100 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-minecraft mb-4">
            Customer Review
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500">
            Apa kata mereka yang sudah merasakan keseruan di MGE.
          </p>
        </div>

        {/* Wrapper untuk Carousel dan Navigasi Kustom */}
        <div className="relative">
          <Swiper
            // 2. Konfigurasi Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: true, // Berhenti autoplay setelah interaksi manual
            }}
            pagination={{ clickable: true }}
            // 3. Hubungkan dengan tombol navigasi kustom
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            // Konfigurasi responsif
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
            className="pb-12" // Padding bawah untuk pagination dots
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                {/* Gradient border wrapper */}
                <div className="p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/70 via-yellow-500/40 to-gray-300/0">
                  {/* Glass card */}
                  <div className="h-full rounded-2xl bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl transition-transform duration-300 ease-out hover:-translate-y-1">
                    <div className="p-8 text-center flex flex-col items-center">
                      {/* Quote icon */}
                      <div className="mb-4 text-yellow-500/80">
                        <FaQuoteLeft className="w-6 h-6" />
                      </div>

                      {/* Avatar with fancy ring */}
                      <div className="mb-5">
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#F5C542] to-[#D4AF37] blur-[2px] opacity-80"></div>
                          <div className="relative w-full h-full rounded-full ring-4 ring-[#D4AF37] bg-gradient-to-br from-yellow-100 to-yellow-200 overflow-hidden">
                            <img
                              src={review.avatarUrl}
                              alt={review.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image: ${review.avatarUrl}`);
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => console.log(`Image loaded successfully: ${review.avatarUrl}`)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-extrabold tracking-tight text-gray-900">{review.name}</h3>

                      {/* Star Rating */}
                      <div className="my-3">
                        <StarRating rating={review.rating} />
                      </div>

                      {/* Review Text */}
                      <blockquote className="text-gray-700 text-sm leading-relaxed max-w-md">
                        “{review.reviewText}”
                      </blockquote>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 4. Tombol Navigasi Kustom dengan Image Anda */}
          <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 -left-20 z-10 cursor-pointer p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
            <img
              src="/images/row-right.png"
              alt="Previous"
              className="h-20 w-20"
            />
          </div>
          <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 -right-20 z-10 cursor-pointer p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
            <img src="/images/row-left.png" alt="Next" className="h-20 w-20" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewSection;
