// src/components/rent/ConsoleSelection.jsx

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { gsap } from "gsap";

const ConsoleSelection = ({ selectedConsole, onSelectConsole }) => {
  const { consoles, status } = useSelector((state) => state.consoles);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  const cardContainerRef = useRef(null);

  // Filter hanya console yang aktif
  const activeConsoles = consoles.filter(console => console.is_active);

  // Debug logging
  console.log("All consoles from API:", consoles);
  console.log("Active consoles after filter:", activeConsoles);
  console.log("Console details:", consoles.map(c => ({
    id: c.id,
    name: c.name,
    is_active: c.is_active,
    amount: c.amount
  })));

  useEffect(() => {
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
          delay: 0.2,
        });
      }
    }
  }, [status, activeConsoles]);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <h3 className="text-2xl font-minecraft text-theme-primary mb-6">
        Console Selection :
      </h3>

      <div
        ref={cardContainerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {activeConsoles.map((gameConsole) => (
          <div
            key={gameConsole.id}
            onClick={() => onSelectConsole(gameConsole)}
            className={`card bg-base-100 shadow-lg cursor-pointer transition-all duration-300 ${selectedConsole?.id === gameConsole.id
              ? "border-2 border-brand-gold ring-4 ring-brand-gold/20 -translate-y-2"
              : "border-2 border-transparent hover:border-brand-gold/50"
              }`}
          >
            <figure className="relative">
              <img
                src={
                  gameConsole.image
                    ? `${imageBaseUrl}/${gameConsole.image}`
                    : "/images/playstation.png"
                }
                alt={gameConsole.name}
                className="h-48 w-full object-cover"
              />
              {gameConsole.amount > 0 && (
                <div className="badge badge-lg bg-green-500 text-white font-semibold absolute top-4 right-4">
                  {gameConsole.amount} Available
                </div>
              )}
            </figure>
            <div className="card-body p-6">
              <h2 className="card-title font-minecraft">{gameConsole.name}</h2>
              <p className="text-sm text-theme-secondary line-clamp-2">
                {gameConsole.description}
              </p>
              <div className="card-actions mt-4">
                <button
                  className={`btn w-full ${selectedConsole?.id === gameConsole.id
                    ? "bg-brand-gold text-white border-brand-gold"
                    : "btn-outline border-gray-300 hover:bg-brand-gold hover:text-white hover:border-brand-gold"
                    }`}
                >
                  {selectedConsole?.id === gameConsole.id ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsoleSelection;
