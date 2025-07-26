import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchGamesThunk } from "../../features/games/gamesSlice";

const GamesSection = () => {
  const dispatch = useDispatch();
  const { games, status, error } = useSelector((state) => state.games);

  // Fetch games data on component mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchGamesThunk());
    }
  }, [dispatch, status]);

  // Filter only active games and limit to 8
  const activeGames = games
    .filter(game => game.is_active)
    .slice(0, 8);

  // Loading state
  if (status === "loading") {
    return (
      <section className="bg-base-200 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-8xl font-minecraft mb-4">Games</h2>
            <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
              Make Good Enough is a place for you to grab a PlayStation, dive into
              epic games, and play without limits—no commitments, just pure gaming
              joy!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <section className="bg-base-200 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-8xl font-minecraft mb-4">Games</h2>
            <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
              Make Good Enough is a place for you to grab a PlayStation, dive into
              epic games, and play without limits—no commitments, just pure gaming
              joy!
            </p>
          </div>
          <div className="text-center text-red-500">
            <p>Failed to load games: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-base-200 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        {/* 1. Judul dan Deskripsi Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-8xl font-minecraft mb-4">Games</h2>
          <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
            Make Good Enough is a place for you to grab a PlayStation, dive into
            epic games, and play without limits—no commitments, just pure gaming
            joy!
          </p>
        </div>

        {/* 3. Grid Kartu Game yang Responsif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeGames.map((game) => {
            // Build image URL
            const imageUrl = game.image
              ? `http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/${game.image}`
              : "/images/playstation.png"; // Fallback image

            return (
              <Link
                to={`/games/${game.id}`}
                key={game.id}
                className="card card-compact bg-base-100 shadow-xl image-full transform hover:-translate-y-2 transition-transform duration-300"
              >
                <figure>
                  <img
                    src={imageUrl}
                    alt={game.title}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.target.src = "/images/playstation.png"; // Fallback if image fails to load
                    }}
                  />
                </figure>
                <div className="card-body justify-end">
                  <h2 className="card-title text-white font-bold">
                    {game.title}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 4. Tombol View More Games */}
        <div className="text-center mt-12">
          <Link
            to="/games"
            className="btn btn-outline border-brand-gold normal-case"
          >
            <img
              src="/images/dice-icon.png"
              alt="more games"
              className="h-5 w-5 mr-2"
            />
            View More Games
          </Link>
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

export default GamesSection;
