// src/components/common/PricelistSection.jsx

import React, { forwardRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPricelistsThunk } from "../../features/pricelists/pricelistsSlice";
import { FaPlaystation, FaCrown } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace(/\s/g, "");

const PricelistSection = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { pricelists, status, error } = useSelector((state) => state.pricelists);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPricelistsThunk());
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return (
      <section ref={ref} className="bg-theme-primary py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-brand-gold mb-4"></div>
            <p className="text-theme-secondary">Loading pricelist...</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "failed") {
    return (
      <section ref={ref} className="bg-theme-primary py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Failed to load pricelist: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  const getRoomIcon = (roomName) => {
    const name = roomName.toLowerCase();
    if (name.includes('vvip')) return <FaCrown className="text-yellow-600" />;
    if (name.includes('vip')) return <FaCrown className="text-yellow-500" />;
    return <FaPlaystation className="text-yellow-600" />;
  };

  return (
    <section ref={ref} className="bg-theme-primary py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-4 h-4 bg-brand-gold"></div>
            <h1 className="text-4xl lg:text-[96px] font-minecraft text-theme-primary">
              Pricelist
            </h1>
            <div className="w-4 h-4 bg-brand-gold"></div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-gold "></div>
              <div className="w-2 h-2 bg-black "></div>
              <div className="w-2 h-2 bg-brand-gold "></div>
            </div>
          </div>
          <p className="text-theme-secondary max-w-xl mx-auto leading-relaxed">
            Pilih ruangan dan konsol sesuai seleramu.<br />
            Transparan dan tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Room Cards - Horizontal Flex Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricelists.map((room) => (
            <div
              key={room.room_name}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Room Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {getRoomIcon(room.room_name)}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {room.room_name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
                  <IoMdPeople className="w-4 h-4" />
                  <span className="text-sm">Kapasitas: 1-{room.max_visitors} Orang</span>
                </div>
              </div>

              {/* Units List */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {room.units.map((unit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {unit.unit_name}
                        </span>
                        <FaPlaystation className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(unit.price_per_hour)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          /jam
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
            <div className="h-3 w-3 bg-gray-800 rounded-full"></div>
            <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PricelistSection;
