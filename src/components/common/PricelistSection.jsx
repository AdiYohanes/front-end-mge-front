// src/components/common/PricelistSection.jsx

import React, { forwardRef } from "react";
import { FaPlaystation, FaTicketAlt } from "react-icons/fa";
import { RiNetflixFill, RiVipCrownFill } from "react-icons/ri";
import { BsNintendoSwitch } from "react-icons/bs";
import { IoMdPeople } from "react-icons/io";

const pricelistData = [
  {
    name: "Reguler",
    icon: <FaTicketAlt className="mr-3" />,
    occupancy: "1-2 Orang",
    items: [
      { name: "Room 1", features: ["PS4"], price: 10000 },
      { name: "Room 2", features: ["PS4"], price: 10000 },
      { name: "Room 3", features: ["PS4"], price: 10000 },
      { name: "Room 4", features: ["PS4"], price: 10000 },
      { name: "Room 5", features: ["PS4"], price: 10000 },
      { name: "Room 6", features: ["PS5"], price: 15000 },
    ],
  },
  {
    name: "VIP Room",
    icon: <RiVipCrownFill className="mr-3" />,
    occupancy: "4-6 Orang",
    items: [
      { name: "VIP 1", features: ["PS4", "Netflix"], price: 20000 },
      { name: "VIP 2", features: ["PS4", "Netflix", "Nintendo"], price: 25000 },
      { name: "VIP 3", features: ["PS5", "Netflix"], price: 25000 },
      { name: "VIP 4", features: ["PS5", "Netflix"], price: 25000 },
    ],
  },
  {
    name: "VVIP Room",
    icon: <RiVipCrownFill className="mr-3 text-primary" />,
    occupancy: "6-10 Orang",
    items: [{ name: "VVIP 1", features: ["PS5", "Netflix"], price: 35000 }],
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace(/\s/g, "");

const FeatureIcon = ({ feature }) => {
  const iconMap = {
    PS4: { icon: <FaPlaystation />, tip: "PlayStation 4" },
    PS5: {
      icon: <FaPlaystation className="text-blue-500" />,
      tip: "PlayStation 5",
    },
    Netflix: {
      icon: <RiNetflixFill className="text-red-600" />,
      tip: "Netflix Ready",
    },
    Nintendo: {
      icon: <BsNintendoSwitch className="text-red-500" />,
      tip: "Nintendo Switch",
    },
  };
  const selected = iconMap[feature] || { icon: null, tip: feature };
  return (
    <div className="tooltip" data-tip={selected.tip}>
      {selected.icon}
    </div>
  );
};

const PricelistSection = forwardRef((props, ref) => {
  return (
    // 1. Pasang ref yang diterima ke elemen <section>
    <section ref={ref} className="bg-base-200 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-minecraft mb-4">
            Pricelist
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500">
            Pilih ruangan dan konsol sesuai seleramu. Transparan dan tanpa biaya
            tersembunyi.
          </p>
        </div>

        {/* --- Layout Grid 3 Kolom Utama --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {pricelistData.map((category) => (
            // --- Satu Kolom untuk setiap Kategori ---
            <div key={category.name}>
              {/* Header Kategori */}
              <div className="border-b-2 border-primary pb-3 mb-6">
                <h3 className="text-3xl font-minecraft text-base-content flex items-center">
                  {category.icon}
                  <span>{category.name}</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <IoMdPeople className="mr-2" />
                  <span>Kapasitas: {category.occupancy}</span>
                </p>
              </div>

              {/* Daftar Item di dalam Kolom */}
              <div className="space-y-2">
                {category.items.map((item) => (
                  // --- Baris Item yang Compact (Nama & Ikon Sejajar) ---
                  <div
                    key={item.name}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-base-100 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-base-content w-24">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xl text-gray-500">
                        {item.features.map((feature) => (
                          <FeatureIcon key={feature} feature={feature} />
                        ))}
                      </div>
                    </div>
                    <div className="font-bold text-base text-base-content whitespace-nowrap">
                      {formatPrice(item.price)}
                      <span className="text-xs font-normal text-gray-500">
                        /jam
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dekorasi Bawah Tengah */}
        <div className="flex justify-center mt-20">
          <div className="flex items-center gap-5">
            <div className="h-3 w-3 bg-black"></div>
            <div className="h-3 w-3 bg-brand-gold"></div>
            <div className="h-3 w-3 bg-black"></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PricelistSection;
