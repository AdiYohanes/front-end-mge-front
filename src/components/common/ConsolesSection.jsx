// src/components/common/ConsolesSection.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsolesThunk } from "../../features/consoles/consolesSlice";

const ConsolesSection = () => {
  const dispatch = useDispatch();
  const { consoles, status, error } = useSelector((state) => state.consoles);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchConsolesThunk());
    }
  }, [dispatch, status]);

  // Filter consoles with amount > 0 (show all available consoles)
  const availableConsoles = consoles.filter(console => console.amount > 0);

  // Debug logging
  console.log("All consoles from API:", consoles);
  console.log("Available consoles after filter:", availableConsoles);
  console.log("Console details:", consoles.map(c => ({
    id: c.id,
    name: c.name,
    is_active: c.is_active,
    amount: c.amount
  })));

  if (status === "loading") {
    return (
      <section className="bg-theme-primary py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-4 h-4 bg-brand-gold"></div>
            <h2 className="text-4xl lg:text-9xl font-minecraft text-theme-primary">Consoles</h2>
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
            <h2 className="text-4xl lg:text-9xl font-minecraft text-theme-primary">Consoles</h2>
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
          <h2 className="text-4xl lg:text-9xl font-minecraft text-theme-primary">Consoles</h2>
          <div className="w-4 h-4 bg-brand-gold"></div>
        </div>

        {/* 2. Layout Utama: Gambar Kiri, Console Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 3. Kolom Kiri: Gambar Statis */}
          <div>
            <img
              src="/images/playstation.png"
              alt="PlayStation Consoles"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>

          {/* 4. Kolom Kanan: Semua Console yang Tersedia */}
          <div className="space-y-10">
            {availableConsoles.map((console) => (
              <div key={console.id}>
                <h3 className="text-3xl lg:text-6xl font-minecraft text-brand-gold mb-3">
                  {console.name}
                </h3>
                <p className="text-theme-secondary leading-relaxed font-funnel">
                  {console.description}
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
