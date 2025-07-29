// src/components/common/RoomsSection.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchRoomsThunk } from "../../features/rooms/roomsSlice";

const RoomsSection = () => {
  const dispatch = useDispatch();
  const { rooms, status, error } = useSelector((state) => state.rooms);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  // Fetch rooms data on component mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRoomsThunk());
    }
  }, [dispatch, status]);

  // Loading state
  if (status === "loading") {
    return (
      <section className="bg-base-100 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-8xl font-minecraft">Rooms</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card bg-base-200 shadow-xl animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="card-body">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <section className="bg-theme-primary py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-8xl font-minecraft text-theme-primary">Rooms</h2>
          </div>
          <div className="text-center text-red-500">
            <p>Failed to load rooms: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-theme-primary py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-8xl font-minecraft text-theme-primary">Rooms</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            // Build image URL using environment variable
            const imageUrl = room.image
              ? `${imageBaseUrl}/${room.image}`
              : "/images/roomsnya.jpg"; // Fallback image

            return (
              <Link
                to={`/book/${room.id}`}
                key={room.id}
                className="card bg-base-200 shadow-xl group transition-all duration-300 ease-in-out transform hover:-translate-y-2"
              >
                <figure className="overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={room.name}
                    className="h-56 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/images/roomsnya.jpg"; // Fallback if image fails to load
                    }}
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title font-bold">{room.name}</h2>
                  <p className="text-sm text-gray-600">{room.description}</p>
                  {/* Room info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Max Visitors: {room.max_visitors}
                    </p>
                    {/* Console badges - show all available consoles */}
                    {room.consoles && room.consoles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.consoles
                          .filter(console => console.is_active && console.amount > 0)
                          .map((console) => (
                            <span
                              key={console.id}
                              className="bg-brand-gold/80 text-white text-xs px-2 py-1 rounded"
                            >
                              {console.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dekorasi Bawah Tengah */}
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

export default RoomsSection;
