// src/components/rent/RoomTypeSelection.jsx

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { IoMdPeople } from "react-icons/io";

const RoomTypeSelection = ({ rooms, selectedRoomType, onSelectRoomType, isReward = false }) => {
  // Komponen ini tidak lagi men-dispatch, hanya membaca status
  const { status } = useSelector((state) => state.rooms);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  const cardContainerRef = useRef(null);

  useEffect(() => {
    // Animasi akan berjalan setiap kali 'rooms' (data yang difilter) berubah
    if (status === "succeeded" && cardContainerRef.current) {
      const cards = cardContainerRef.current.children;
      if (cards.length > 0) {
        gsap.set(cards, { opacity: 0, y: 30 });
        gsap.to(cards, {
          duration: 0.5,
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.1,
        });
      }
    }
  }, [rooms, status]);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-lg h-96 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <h3 className="text-2xl font-minecraft text-theme-primary mb-6 flex items-center gap-2">
        Room Type :
        {isReward && (
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
            🎁 From Reward
          </span>
        )}
      </h3>

      {rooms.length === 0 && status === "succeeded" ? (
        <div className="text-center p-10 bg-base-100 rounded-lg">
          <p className="font-semibold">
            Tidak ada ruangan yang tersedia untuk jumlah orang tersebut.
          </p>
          <p className="text-sm text-theme-secondary">
            Silakan coba pilih jumlah orang yang lebih sedikit.
          </p>
        </div>
      ) : (
        <div
          ref={cardContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => !isReward && onSelectRoomType(room)}
              className={`card bg-base-100 shadow-lg transition-all duration-300 ${isReward ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                } ${selectedRoomType?.id === room.id
                  ? "border-2 border-brand-gold ring-4 ring-brand-gold/20 -translate-y-2"
                  : "border-2 border-transparent hover:border-brand-gold/50"
                }`}
            >
              <figure className="relative">
                <img
                  src={`${imageBaseUrl}/${room.image}`}
                  alt={room.name}
                  className="h-56 w-full object-cover"
                />
                <div className="badge badge-lg bg-black text-white font-semibold absolute top-4 right-4 flex items-center gap-2">
                  <IoMdPeople />
                  Max {room.max_visitors} Orang
                </div>
                {isReward && selectedRoomType?.id === room.id && (
                  <div className="badge badge-lg bg-green-500 text-white font-semibold absolute top-4 left-4 flex items-center gap-1">
                    🎁 From Reward
                  </div>
                )}
              </figure>
              <div className="card-body p-6">
                <h2 className="card-title font-minecraft">{room.name}</h2>
                <p className="text-sm text-theme-secondary line-clamp-2">
                  {room.description}
                </p>
                <div className="card-actions mt-4">
                  <button
                    className={`btn w-full ${selectedRoomType?.id === room.id
                      ? "bg-brand-gold text-white border-brand-gold"
                      : "btn-outline border-gray-300 hover:bg-brand-gold hover:text-white hover:border-brand-gold"
                      }`}
                  >
                    {selectedRoomType?.id === room.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomTypeSelection;
