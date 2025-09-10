// src/components/common/PricelistSection.jsx

import React, { forwardRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPricelistsThunk } from "../../features/pricelists/pricelistsSlice";
import { FaPlaystation, FaCrown } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { SiPlaystation4, SiPlaystation5, SiNetflix } from "react-icons/si";
import { BsNintendoSwitch } from "react-icons/bs";


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

  const getUnitNumberFromName = (unitName) => {
    const match = String(unitName).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const detectConsoleType = (consoleName) => {
    const name = String(consoleName).toLowerCase();
    if (/(ps\s*5|ps5|playstation\s*5)/.test(name)) return "ps5";
    if (/(ps\s*4|ps4|playstation\s*4)/.test(name)) return "ps4";
    if (/(nintendo\s*switch|switch)/.test(name)) return "switch";
    return null;
  };

  const renderConsoleIcons = (consoles) => {
    const icons = [];
    const seenTypes = new Set();

    if (Array.isArray(consoles)) {
      consoles.forEach((console) => {
        // Handle new structure: console is an object with {id, name}
        const consoleName = console.name || console;
        const type = detectConsoleType(consoleName);
        if (type && !seenTypes.has(type)) {
          seenTypes.add(type);
          if (type === "ps5") {
            icons.push(
              <SiPlaystation5 key={`ps5`} className="w-4 h-4 text-blue-600" aria-label="PlayStation 5" title="PlayStation 5" />
            );
          } else if (type === "ps4") {
            icons.push(
              <SiPlaystation4 key={`ps4`} className="w-4 h-4 text-blue-500" aria-label="PlayStation 4" title="PlayStation 4" />
            );
          } else if (type === "switch") {
            icons.push(
              <BsNintendoSwitch key={`switch`} className="w-4 h-4 text-red-600" aria-label="Nintendo Switch" title="Nintendo Switch" />
            );
          }
        }
      });
    }

    if (icons.length === 0) {
      return <FaPlaystation className="w-4 h-4 text-gray-400" aria-label="Console" title="Console" />;
    }

    return <span className="flex items-center gap-1">{icons}</span>;
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
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Room Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {getRoomIcon(room.room_name)}
                  <h3 className="text-xl font-bold text-black">
                    {room.room_name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-2 text-black">
                  <IoMdPeople className="w-4 h-4" />
                  <span className="text-sm">{room.max_visitors}</span>
                </div>
              </div>

              {/* Units List */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {[...room.units]
                    .sort((a, b) => {
                      const aNum = getUnitNumberFromName(a.unit_name);
                      const bNum = getUnitNumberFromName(b.unit_name);

                      if (aNum === null && bNum === null) {
                        return String(a.unit_name).localeCompare(String(b.unit_name));
                      }
                      if (aNum === null) return -1;
                      if (bNum === null) return 1;
                      if (aNum !== bNum) return aNum - bNum;
                      return String(a.unit_name).localeCompare(String(b.unit_name));
                    })
                    .map((unit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-black font-medium">
                            {unit.unit_name}
                          </span>
                          <div className="flex items-center gap-2">
                            {renderConsoleIcons(unit.consoles)}
                            {unit.has_netflix && (
                              <SiNetflix className="w-4 h-4 text-red-600" aria-label="Netflix" title="Netflix Available" />
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-black">
                            {unit.price_per_hour}
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
            <div className="h-3 w-3 bg-yellow-600 "></div>
            <div className="h-3 w-3 bg-black "></div>
            <div className="h-3 w-3 bg-yellow-600 "></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PricelistSection;
