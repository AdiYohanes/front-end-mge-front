// src/components/common/CustomerReviewSection.jsx

import React from "react";
// 1. Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

// Komponen kecil untuk menampilkan rating bintang (pakai gambar custom)
const StarRating = ({ rating }) => {
  const totalStars = 5;
  const starSrc = "/images/start-reveiw.png";
  if (!rating || rating < 0) return null;
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`Rating ${rating} dari 5`} role="img">
      {Array.from({ length: totalStars }).map((_, index) => (
        <img
          key={index}
          src={starSrc}
          alt={index < rating ? "Filled star" : "Empty star"}
          className={index < rating ? "h-6 w-6" : "h-6 w-6 opacity-25"}
          draggable={false}
        />
      ))}
    </div>
  );
};

const CustomerReviewSection = () => {
  return (
    <section className="bg-theme-primary py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-4 h-4 bg-brand-gold"></div>
            <h2 className="text-4xl lg:text-[96px] font-minecraft">
              Customer Review
            </h2>
            <div className="w-4 h-4 bg-brand-gold"></div>
          </div>
          <p className="max-w-2xl mx-auto text-theme-muted">
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
                {/* Card sesuai desain: border emas, sudut membulat, konten terpusat */}
                <div className="h-full rounded-xl border border-[#D4AF37] bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-8 text-center flex flex-col items-center">
                    {/* Quote mark di atas */}
                    <div className="text-[#D4AF37] text-3xl leading-none mb-4" aria-hidden="true">“</div>

                    {/* Icon review */}
                    <img
                      src="/images/icon-review.png"
                      alt="Reviewer icon"
                      className="w-16 h-16 mb-5 select-none"
                      draggable={false}
                    />

                    {/* Star Rating */}
                    <div className="mb-4">
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{review.name}</h3>

                    {/* Review Text */}
                    <p className="text-gray-700 text-sm leading-relaxed max-w-xs">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 4. Tombol Navigasi Kustom dengan Image Anda */}
          <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 -left-20 z-10 cursor-pointer p-2 bg-white/50 dark:bg-gray-800/50 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <img
              src="/images/row-right.png"
              alt="Previous"
              className="h-20 w-20"
            />
          </div>
          <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 -right-20 z-10 cursor-pointer p-2 bg-white/50 dark:bg-gray-800/50 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <img src="/images/row-left.png" alt="Next" className="h-20 w-20" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewSection;
