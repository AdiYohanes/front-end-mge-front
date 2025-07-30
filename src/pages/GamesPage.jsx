// src/pages/GamesPage.jsx

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchGamesThunk } from "../features/games/gamesSlice";
import { gsap } from "gsap"; // Import GSAP

const GamesPage = () => {
  const dispatch = useDispatch();
  const { games, status, error } = useSelector((state) => state.games);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  const gridRef = useRef(null);
  const headerRef = useRef(null);
  const hasAnimated = useRef(false); // Flag untuk mencegah animasi berulang

  // useEffect untuk mengambil data
  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchGamesThunk());
    }
  }, [status, dispatch]);

  // useEffect untuk animasi header saat komponen mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.set(headerRef.current.children, { opacity: 0, y: 30 });
      gsap.to(headerRef.current.children, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2,
      });
    }
  }, []);

  // useEffect untuk animasi grid cards
  useEffect(() => {
    if (status === "succeeded" && gridRef.current && !hasAnimated.current) {
      const cards = gridRef.current.children;

      if (cards.length > 0) {
        // Set initial state
        gsap.set(cards, {
          opacity: 0,
          y: 50,
          scale: 0.9,
        });

        // Animate cards
        gsap.to(cards, {
          duration: 0.7,
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: {
            amount: 0.6,
            from: "start",
          },
          ease: "power3.out",
          delay: 0.3,
          onComplete: () => {
            hasAnimated.current = true;
          },
        });
      }
    }
  }, [status, games]);

  // Reset animasi flag ketika status berubah ke loading
  useEffect(() => {
    if (status === "loading") {
      hasAnimated.current = false;
    }
  }, [status]);

  let content;

  // State: Loading (menampilkan skeleton)
  if (status === "loading") {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-lg h-80 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }
  // State: Berhasil
  else if (status === "succeeded") {
    content = (
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="relative bg-base-100 rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 will-change-transform"
          >
            <div className="overflow-hidden h-64">
              <img
                src={`${imageBaseUrl}/${game.image}`}
                alt={game.title}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:opacity-60"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 mx-4 text-center">
                <span className="badge badge-primary font-semibold mb-3">
                  {typeof game.genre === 'object' && game.genre?.name ? game.genre.name : game.genre || 'Unknown Genre'}
                </span>
                <h2 className="text-white font-bold text-xl lg:text-2xl">
                  {game.title}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  // State: Gagal
  else if (status === "failed") {
    content = (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="animate-bounce mb-4">
          <svg
            className="w-16 h-16 text-error mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="font-semibold text-lg text-error mb-2">
          Oops! Something went wrong.
        </p>
        <p className="text-gray-600 text-sm mb-6">{error}</p>
        <button
          onClick={() => {
            hasAnimated.current = false; // Reset flag saat retry
            dispatch(fetchGamesThunk());
          }}
          className="btn btn-neutral btn-sm hover:btn-primary transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-theme-secondary min-h-screen">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-minecraft mb-4 text-theme-primary">
            Game Library
          </h1>
          <p className="text-theme-secondary max-w-lg mx-auto leading-relaxed">
            Temukan dan jelajahi semua koleksi game yang kami sediakan untuk
            pengalaman bermain terbaikmu.
          </p>
        </div>

        {/* Konten Dinamis (Grid, Loading, atau Error) */}
        <div>{content}</div>
      </div>
    </div>
  );
};

export default GamesPage;
