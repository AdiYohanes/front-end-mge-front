// src/components/rent/GameSelectionUnit.jsx

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router";

const GameSelectionUnit = ({
  unitName,
  availableGames,
  selectedGame,
  onSelectGame,
}) => {
  const containerRef = useRef(null);
  const gamesGridRef = useRef(null);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 0, y: 20 });
      gsap.to(containerRef.current, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: "power3.out",
      });
    }
    if (gamesGridRef.current) {
      gsap.set(gamesGridRef.current.children, { opacity: 0, y: 20 });
      gsap.to(gamesGridRef.current.children, {
        duration: 0.5,
        opacity: 1,
        y: 0,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.2,
      });
    }
  }, [unitName, availableGames]); // Animasi berjalan setiap kali data berubah

  return (
    <div
      ref={containerRef}
      className="mt-8 w-full p-6 bg-base-100 rounded-lg shadow-inner"
    >
      <div className="text-center">
        <h3 className="text-2xl font-normal text-theme-primary flex items-center justify-center gap-2 font-minecraft">
          <img
            src="/Icon/Available Game List.svg"
            alt="Available Game List"
            className="w-6 h-6"
          />
          Available Game List for {unitName}
        </h3>
        <p className="text-sm text-theme-secondary mt-1">
          Please select the first game you want to play:
        </p>
      </div>

      {/* Jika tidak ada game, tampilkan pesan */}
      {availableGames.length === 0 ? (
        <p className="text-center text-theme-secondary mt-6 py-8">
          No specific games listed for this unit.
        </p>
      ) : (
        <div
          ref={gamesGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
        >
          {availableGames.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game)}
              className={`flex items-center p-3 rounded-lg border transition-all duration-200 text-left
                ${selectedGame?.id === game.id
                  ? "bg-brand-gold text-white border-brand-gold shadow-lg ring-2 ring-brand-gold/30"
                  : "border-base-300 bg-base-100 hover:bg-base-200 hover:shadow-md"
                }
              `}
            >
              <img
                src={
                  game.image
                    ? `${imageBaseUrl}/${game.image}`
                    : "/images/games/game-placeholder.jpg"
                }
                alt={game.title}
                className="w-16 h-10 object-cover rounded-md mr-4 flex-shrink-0"
              />
              <span className="font-semibold">{game.title}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-theme-secondary mt-6">
        You can check the complete directory of our games{" "}
        <Link to="/games" className="link text-brand-gold font-semibold">
          here
        </Link>
        .
      </p>
    </div>
  );
};

export default GameSelectionUnit;
