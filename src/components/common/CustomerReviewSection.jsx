// src/components/common/CustomerReviewSection.jsx

import React from "react";
// 1. Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import ikon untuk rating bintang
import { FaStar } from "react-icons/fa";

// Data ulasan pelanggan
const reviews = [
  {
    id: 1,
    name: 'Andi "Pro Player" Wijaya',
    avatarUrl: "/images/avatars/avatar-1.jpg",
    rating: 5,
    reviewText:
      "Tempatnya nyaman banget, koleksi gamenya update terus. PS5-nya kenceng, gak ada lag sama sekali. Pasti balik lagi!",
  },
  {
    id: 2,
    name: 'Siti "Gamer Santai" Lestari',
    avatarUrl: "/images/avatars/avatar-2.jpg",
    rating: 4,
    reviewText:
      "Suka sama VIP Room-nya, bisa sambil nonton Netflix. Snack dan minumannya juga enak-enak. Harganya worth it.",
  },
  {
    id: 3,
    name: 'Budi "Mabar" Santoso',
    avatarUrl: "/images/avatars/avatar-3.jpg",
    rating: 5,
    reviewText:
      "Pilihan terbaik buat mabar bareng teman-teman. Ruangannya luas, sofanya empuk. Staff-nya juga ramah dan sangat membantu.",
  },
  {
    id: 4,
    name: 'Rina "Family Time" Hartono',
    avatarUrl: "/images/avatars/avatar-4.jpg",
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
                <div className="card bg-base-200 h-full p-8 text-center items-center rounded-lg shadow">
                  <div className="avatar mb-4">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={review.avatarUrl} alt={review.name} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{review.name}</h3>
                  <div className="my-2">
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-600 text-sm">"{review.reviewText}"</p>
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
