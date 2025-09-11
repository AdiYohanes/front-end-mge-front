import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { gsap } from "gsap";

// Import semua komponen anak
import BookingSummary from "../components/rent/BookingSummary";
import BookingNavigator from "../components/rent/BookingNavigator";
import ConsoleSelection from "../components/rent/ConsoleSelection";
import RoomTypeSelection from "../components/rent/RoomTypeSelection";
import GameSelectionUnit from "../components/rent/GameSelectionUnit";
import DateSelection from "../components/rent/DateSelection";
import TimeSelection from "../components/rent/TimeSelection";
import FoodAndDrinksSelection from "../components/rent/FoodAndDrinksSelection";

// Import semua Thunk yang dibutuhkan
import { fetchConsolesThunk } from "../features/consoles/consolesSlice";
import { fetchRoomsThunk } from "../features/rooms/roomsSlice";
import { fetchUnitsThunk } from "../features/units/unitsSlice";
import { fetchTimeSlotsThunk } from "../features/availability/availabilitySlice";
import {
  fetchFnbsThunk,
  fetchFnbsCategoriesThunk,
} from "../features/fnbs/fnbsSlice";
import { fetchDurations } from "../features/availability/durationApi";

// Import Ikon
import { IoMdPeople } from "react-icons/io";
import { FaClock } from "react-icons/fa";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

const RentPage = () => {
  const location = useLocation();

  // Initialize with preserved data if coming back from payment page
  const initialBookingDetails = location.state?.bookingDetails || {
    console: null,
    roomType: null,
    psUnit: null,
    unitPrice: 0,
    selectedGames: [],
    date: null,
    startTime: null,
    duration: null,
    foodAndDrinks: [],
    notes: "",
    subtotal: 0,
    numberOfPeople: null,
    rewardInfo: null,
  };

  const initialStep = location.state?.currentStep || 1;

  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showBookingSummary, setShowBookingSummary] = useState(true);
  const [availableDurations, setAvailableDurations] = useState([]);
  const [durationsLoading, setDurationsLoading] = useState(false);
  const pageRef = useRef(null);
  const rewardGamesUpdatedRef = useRef(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ambil semua status yang relevan dari Redux
  const { status: consolesStatus } = useSelector((state) => state.consoles);
  const { rooms: allRooms, status: roomsStatus } = useSelector(
    (state) => state.rooms
  );
  const { units, status: unitsStatus } = useSelector((state) => state.units);
  const { status: fnbsStatus } = useSelector((state) => state.fnbs);
  const { user } = useSelector((state) => state.auth);
  const [isOtsBooking, setIsOtsBooking] = useState(false);

  // Handle preserved data when coming back from payment page
  useEffect(() => {
    if (location.state?.preserveData && location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
      setCurrentStep(location.state.currentStep || 4);

      // Clear the navigation state to prevent issues with browser back/forward
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Check if user is admin for OTS booking
  useEffect(() => {
    console.log("RentPage - User role:", user?.role);
    if (user?.role === 'admin' || user?.role === 'ADMN') {
      console.log("RentPage - Setting isOtsBooking to true");
      setIsOtsBooking(true);
    }
  }, [user]);

  // Handle reward data when coming from ProfileRewardsPage
  useEffect(() => {
    if (location.state?.fromReward && location.state?.rewardData) {
      const rewardData = location.state.rewardData;
      console.log("RentPage - Reward data received:", rewardData);

      // Extract reward details
      const rewardDetails = rewardData.reward_details;
      const bookingPreset = rewardData.booking_preset;
      const priceAdjustment = rewardData.price_adjustment;

      if (rewardDetails && bookingPreset) {
        // Get console name from booking preset
        const consoleName = bookingPreset.consoles?.[0]?.name || "PlayStation";

        // Set booking details based on reward data
        console.log("RentPage - Setting reward booking details:", {
          unitId: bookingPreset.unit_id,
          unitIdType: typeof bookingPreset.unit_id,
          unitName: rewardDetails.unit?.name,
          consoleName,
          roomName: rewardDetails.unit?.room?.name
        });

        setBookingDetails(prev => ({
          ...prev,
          console: consoleName,
          roomType: {
            id: rewardDetails.unit?.room?.id,
            name: rewardDetails.unit?.room?.name || "Reguler",
            max_visitors: rewardDetails.unit?.room?.max_visitors || 2,
            description: rewardDetails.unit?.room?.description || "",
            is_available: rewardDetails.unit?.room?.is_available !== false,
            image: rewardDetails.unit?.room?.image
          },
          psUnit: {
            id: bookingPreset.unit_id,
            name: rewardDetails.unit?.name || "Reguler 1",
            price: priceAdjustment?.final_session_price || 0,
            games: [] // Will be populated when units are loaded
          },
          unitPrice: priceAdjustment?.final_session_price || 0,
          duration: bookingPreset.duration_hours,
          numberOfPeople: bookingPreset.total_visitors || 1,
          // Set reward information for display
          rewardInfo: {
            name: rewardDetails.name,
            description: rewardDetails.description,
            originalPrice: priceAdjustment?.original_session_price || 0,
            discountAmount: priceAdjustment?.discount_amount || 0,
            finalPrice: priceAdjustment?.final_session_price || 0,
            message: priceAdjustment?.message || "Reward applied!",
            userRewardId: rewardData.user_reward_id
          }
        }));

        // Set available durations for reward booking
        setAvailableDurations([bookingPreset.duration_hours]);
        console.log("RentPage - Reward duration set:", bookingPreset.duration_hours);
        console.log("RentPage - Available durations set:", [bookingPreset.duration_hours]);

        // Skip to step 2 (game selection) since console, room, unit, duration are pre-selected but game, date, time need to be chosen
        setCurrentStep(2);

        // Trigger units API call to load games for the reward unit
        const params = {
          console_name: rewardDetails.unit?.console?.name || consoleName,
          room_name: rewardDetails.unit?.room?.name || "Reguler",
        };
        console.log("RentPage - Fetching units for reward with params:", params);
        console.log("RentPage - Reward unit console:", rewardDetails.unit?.console);
        console.log("RentPage - Reward unit room:", rewardDetails.unit?.room);
        dispatch(fetchUnitsThunk(params));

        // Clear the navigation state to prevent issues with browser back/forward
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, navigate, location.pathname, dispatch]);

  // Animasi masuk
  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.children;
      gsap.set(elements, { opacity: 0, y: 30 });
      gsap.to(elements, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.1,
      });
    }
  }, []);

  // -- LOGIKA PENGAMBILAN DATA TERPUSAT --
  useEffect(() => {
    if (currentStep === 1 && consolesStatus === "idle") {
      dispatch(fetchConsolesThunk());
    }
    if (currentStep === 2 && roomsStatus === "idle") {
      dispatch(fetchRoomsThunk());
    }
    if (currentStep === 4 && fnbsStatus === "idle") {
      dispatch(fetchFnbsThunk());
      dispatch(fetchFnbsCategoriesThunk());
    }
  }, [currentStep, consolesStatus, roomsStatus, fnbsStatus, dispatch]);

  // Mengambil data unit berdasarkan pilihan konsol & ruangan
  useEffect(() => {
    if (bookingDetails.console && bookingDetails.roomType) {
      const params = {
        console_name: bookingDetails.console,
        room_name: bookingDetails.roomType.name,
      };
      dispatch(fetchUnitsThunk(params));
    }
  }, [bookingDetails.console, bookingDetails.roomType, dispatch]);

  // Memoize unit ID to prevent unnecessary re-renders
  const unitId = useMemo(() => bookingDetails.psUnit?.id, [bookingDetails.psUnit?.id]);
  const hasReward = useMemo(() => !!bookingDetails.rewardInfo, [bookingDetails.rewardInfo]);

  // Update reward unit with games after units are fetched
  useEffect(() => {
    if (hasReward && unitId && units.length > 0 && !rewardGamesUpdatedRef.current) {
      console.log("RentPage - Debug reward unit loading:", {
        unitId,
        unitIdType: typeof unitId,
        unitsLength: units.length,
        units: units.map(u => ({ id: u.id, name: u.name, type: typeof u.id }))
      });

      // Try multiple comparison methods to handle type mismatch
      const unitFromApi = units.find(unit =>
        unit.id === unitId ||
        unit.id === parseInt(unitId, 10) ||
        parseInt(unit.id, 10) === unitId ||
        String(unit.id) === String(unitId)
      );
      console.log("RentPage - Unit search result:", unitFromApi);

      if (unitFromApi) {
        console.log("RentPage - Updating reward unit with complete unit data including games:", unitFromApi.games?.length || 0, "games");
        setBookingDetails(prev => ({
          ...prev,
          psUnit: {
            ...prev.psUnit,
            ...unitFromApi, // Update with complete unit data including games
            // Preserve reward-specific data
            price: prev.psUnit.price, // Keep reward price
            name: prev.psUnit.name, // Keep reward unit name
          }
        }));
        rewardGamesUpdatedRef.current = true; // Mark as updated
      } else {
        console.log("RentPage - Unit not found in API response");
        console.log("RentPage - Available unit IDs:", units.map(u => u.id));
        console.log("RentPage - Looking for unit ID:", unitId);
        // Mark as updated to prevent infinite loop
        rewardGamesUpdatedRef.current = true;
      }
    }
  }, [units, hasReward, unitId]);

  // Reset reward games updated flag when reward changes
  useEffect(() => {
    if (!hasReward) {
      rewardGamesUpdatedRef.current = false;
    }
  }, [hasReward]);

  // Mengambil data JAM setelah TANGGAL dipilih
  useEffect(() => {
    if (bookingDetails.date && bookingDetails.psUnit) {
      dispatch(
        fetchTimeSlotsThunk({
          unitId: bookingDetails.psUnit.id,
          date: bookingDetails.date,
        })
      );
    }
  }, [bookingDetails.date, bookingDetails.psUnit, dispatch]);

  // Mengambil available durations dari API ketika unit, date dan start time dipilih
  useEffect(() => {
    if (bookingDetails.psUnit?.id && bookingDetails.date && bookingDetails.startTime) {
      const fetchAvailableDurations = async () => {
        setDurationsLoading(true);
        try {
          const unitId = bookingDetails.psUnit?.id;
          const d = bookingDetails.date;
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // Local YYYY-MM-DD
          const durations = await fetchDurations(unitId, dateStr, bookingDetails.startTime);

          // For reward booking, ensure reward duration is always available
          if (bookingDetails.rewardInfo && bookingDetails.duration) {
            const rewardDuration = bookingDetails.duration;
            const durationsWithReward = durations || [];
            if (!durationsWithReward.includes(rewardDuration)) {
              durationsWithReward.push(rewardDuration);
              durationsWithReward.sort((a, b) => a - b); // Sort durations
            }
            setAvailableDurations(durationsWithReward);
          } else {
            setAvailableDurations(durations || []);

            // Reset duration if current duration is not available (only for non-reward booking)
            if (bookingDetails.duration && !durations.includes(bookingDetails.duration)) {
              setBookingDetails(prev => ({ ...prev, duration: null }));
            }
          }
        } catch {
          setAvailableDurations([]);
        } finally {
          setDurationsLoading(false);
        }
      };

      fetchAvailableDurations();
    } else {
      // For reward booking without date/time, still show the reward duration
      if (bookingDetails.rewardInfo && bookingDetails.duration) {
        setAvailableDurations([bookingDetails.duration]);
      } else {
        setAvailableDurations([]);
      }
    }
  }, [bookingDetails.psUnit, bookingDetails.date, bookingDetails.startTime, bookingDetails.duration, bookingDetails.rewardInfo]);

  // Menghitung subtotal secara otomatis
  useEffect(() => {
    let basePrice = 0;

    // If reward is applied, use the final price from reward data
    if (bookingDetails.rewardInfo) {
      basePrice = bookingDetails.rewardInfo.finalPrice || 0;
    } else {
      // Normal calculation for non-reward bookings
      basePrice = (bookingDetails.unitPrice || 0) * (bookingDetails.duration || 0);
    }

    const fnbTotal = bookingDetails.foodAndDrinks.reduce((total, item) => {
      return total + parseInt(item.price, 10) * item.quantity;
    }, 0);
    const newSubtotal = basePrice + fnbTotal;
    setBookingDetails((prev) => ({ ...prev, subtotal: newSubtotal }));
  }, [
    bookingDetails.unitPrice,
    bookingDetails.duration,
    bookingDetails.foodAndDrinks,
    bookingDetails.rewardInfo,
  ]);

  // -- HANDLERS UNTUK SETIAP LANGKAH --

  const handleSelectConsole = (console) => {
    setBookingDetails((prev) => ({
      ...prev,
      console: console.name,
      roomType: null,
      psUnit: null,
      selectedGames: [],
      unitPrice: 0,
      foodAndDrinks: [],
    }));
  };

  const handleNextToStep2 = () => {
    if (bookingDetails.console) {
      setCurrentStep(2);
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectRoomType = (room) => {
    setBookingDetails((prev) => ({
      ...prev,
      roomType: room,
      psUnit: null,
      selectedGames: [],
      unitPrice: 0,
      foodAndDrinks: [],
    }));
  };

  const handlePsUnitChange = (e) => {
    const selectedUnitId = parseInt(e.target.value, 10);
    const selectedUnitObject = filteredUnits.find((unit) => unit.id === selectedUnitId);
    setBookingDetails((prev) => ({
      ...prev,
      psUnit: selectedUnitObject,
      unitPrice: parseInt(selectedUnitObject.price, 10),
      selectedGames: [],
    }));
  };

  const handleSelectGame = (game) => {
    setBookingDetails((prev) => ({ ...prev, selectedGames: [game] }));
  };

  const handleNextToStep3 = () => {
    if (bookingDetails.psUnit && bookingDetails.selectedGames.length > 0) {
      // For reward booking, skip step 4 and go directly to payment
      if (bookingDetails.rewardInfo) {
        console.log("RentPage - Reward booking detected, skipping to payment page");
        handleFinalizeBooking();
        return;
      }

      // Normal booking goes to step 3 for date and time selection
      setCurrentStep(3);
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectDate = (date) => {
    setBookingDetails((prev) => ({
      ...prev,
      date: date,
      startTime: null,
      // Keep duration for reward booking, reset for normal booking
      duration: prev.rewardInfo ? prev.duration : null,
    }));
  };

  const handleSelectTime = (time) => {
    setBookingDetails((prev) => {
      const maxDuration = getMaxDuration(time);
      const currentDuration = prev.duration;

      // For reward booking, always keep the reward duration
      // For normal booking, reset duration if it exceeds max allowed for this time
      const newDuration = prev.rewardInfo
        ? prev.duration  // Keep reward duration
        : (currentDuration && currentDuration <= maxDuration ? currentDuration : null);

      return {
        ...prev,
        startTime: time,
        duration: newDuration
      };
    });
  };

  const handleDurationChange = (e) => {
    setBookingDetails((prev) => ({
      ...prev,
      duration: e.target.value ? parseInt(e.target.value, 10) : null,
    }));
  };

  // Helper function to calculate maximum duration for display purposes
  const getMaxDuration = (startTime) => {
    if (!startTime || availableDurations.length === 0) return 2;
    return Math.max(...availableDurations);
  };

  const handleNextToStep4 = () => {
    if (bookingDetails.startTime && bookingDetails.duration) {
      // For reward booking, skip step 4 and go directly to payment
      if (bookingDetails.rewardInfo) {
        console.log("RentPage - Reward booking detected, skipping step 4 to payment page");
        handleFinalizeBooking();
        return;
      }

      // Normal booking goes to step 4 for F&B selection
      setTimeout(() => {
        setCurrentStep(4);
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handleFnbChange = (item, newQuantity) => {
    setBookingDetails((prev) => {
      const existingItem = prev.foodAndDrinks.find((fnb) => fnb.id === item.id);
      let newFoodAndDrinks;
      if (existingItem) {
        if (newQuantity > 0) {
          newFoodAndDrinks = prev.foodAndDrinks.map((fnb) =>
            fnb.id === item.id ? { ...fnb, quantity: newQuantity } : fnb
          );
        } else {
          newFoodAndDrinks = prev.foodAndDrinks.filter(
            (fnb) => fnb.id !== item.id
          );
        }
      } else if (newQuantity > 0) {
        newFoodAndDrinks = [
          ...prev.foodAndDrinks,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: newQuantity,
          },
        ];
      } else {
        newFoodAndDrinks = prev.foodAndDrinks;
      }
      return { ...prev, foodAndDrinks: newFoodAndDrinks };
    });
  };

  const handleFinalizeBooking = () => {
    console.log("RentPage - handleFinalizeBooking called with isOtsBooking:", isOtsBooking);
    if (user) {
      // User is logged in, proceed to payment page
      console.log("RentPage - Navigating to BookingPaymentPage (logged in) with isOtsBooking:", isOtsBooking);
      navigate("/booking-payment", {
        state: {
          bookingDetails,
          fromReward: location.state?.fromReward || false,
          rewardData: location.state?.rewardData || null,
          isOtsBooking: isOtsBooking
        }
      });
    } else {
      // User is not logged in, proceed to guest booking page
      console.log("RentPage - Navigating to BookingPaymentPage (guest) with isOtsBooking:", isOtsBooking);
      navigate("/booking-payment", {
        state: {
          bookingDetails,
          isGuestBooking: true,
          fromReward: location.state?.fromReward || false,
          rewardData: location.state?.rewardData || null,
          isOtsBooking: isOtsBooking
        }
      });
    }
  };

  const filteredRooms = allRooms.filter(
    (room) => room.max_visitors >= bookingDetails.numberOfPeople
  );

  // Filter units based on selected console and room
  const filteredUnits = useMemo(() => {
    if (!bookingDetails.console || !bookingDetails.roomType) {
      return [];
    }

    return units.filter(unit => {
      // Check if unit belongs to selected room
      const belongsToRoom = unit.room_id === bookingDetails.roomType.id;

      // Check if unit's room has the selected console
      const room = allRooms.find(r => r.id === unit.room_id);
      const hasConsole = room?.consoles?.some(console => console.name === bookingDetails.console);

      return belongsToRoom && hasConsole;
    });
  }, [units, bookingDetails.console, bookingDetails.roomType, allRooms]);

  const handleToggleBookingSummary = () => {
    setShowBookingSummary(prev => !prev);
  };

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex flex-col items-center">
      <div ref={pageRef} className="flex flex-col items-center w-full">
        <h1 className="text-4xl lg:text-5xl font-minecraft mb-6 text-theme-primary">
          Book a Room
        </h1>

        {/* OTS Booking Banner */}
        {isOtsBooking && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏪</div>
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-1">
                  OTS (Over The Counter) Booking Mode
                </h3>
                <p className="text-sm text-blue-600">
                  You are logged in as admin. This booking will be processed as OTS with cash payment.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mb-12">
          <div className="h-3 w-3 bg-black"></div>
          <div className="h-3 w-3 bg-brand-gold"></div>
          <div className="h-3 w-3 bg-black"></div>
        </div>
        {showBookingSummary ? (
          <div className="w-full max-w-3xl mb-6">
            {/* Single Header with Toggle */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="font-minecraft text-2xl text-brand-gold">
                  Booking Summary
                </h2>
                <button
                  className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100 transition-colors"
                  onClick={handleToggleBookingSummary}
                  aria-label="Hide booking summary"
                >
                  <IoIosArrowUp size={24} className="text-brand-gold" />
                </button>
              </div>

              {/* Full Booking Summary Content */}
              <div className="p-6 pt-0">
                <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-black mb-2">
                  <span>Type</span>
                  <span>Description</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="border-t border-gray-200 pb-2"></div>
                <div className="mt-4 space-y-4">
                  {(() => {
                    const formattedDate = bookingDetails.date
                      ? new Date(bookingDetails.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : null;

                    const fnbItems = bookingDetails.foodAndDrinks?.length > 0
                      ? bookingDetails.foodAndDrinks
                      : [];


                    // Calculate unit total price (unit price * duration)
                    const unitTotalPrice = bookingDetails.psUnit && bookingDetails.duration
                      ? bookingDetails.unitPrice * bookingDetails.duration
                      : 0;

                    const summaryItems = [
                      {
                        label: "Console",
                        value: bookingDetails.console,
                      },
                      {
                        label: "Room Type",
                        value: bookingDetails.roomType?.name,
                      },
                      {
                        label: "PS Unit",
                        value: bookingDetails.psUnit ? `${bookingDetails.psUnit.name} (${new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(bookingDetails.unitPrice).replace(/\s/g, "")}/jam)` : "-",
                        total: "-",
                      },
                      {
                        label: "Game",
                        value: bookingDetails.selectedGames[0]?.title,
                      },
                      {
                        label: "Date",
                        value: formattedDate,
                      },
                      {
                        label: "Start Time",
                        value: bookingDetails.startTime,
                      },
                      {
                        label: "Duration",
                        value: bookingDetails.duration ? `${bookingDetails.duration} Hour(s)` : null,
                        total: unitTotalPrice > 0 ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(unitTotalPrice).replace(/\s/g, "") : "-",
                      },
                      ...(fnbItems.length > 0 ? fnbItems.map((item, index) => {
                        const itemTotal = parseInt(item.price, 10) * item.quantity;
                        return {
                          label: index === 0 ? "Food & Drinks" : "",
                          value: `${item.name} (x${item.quantity})`,
                          total: new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(itemTotal).replace(/\s/g, ""),
                        };
                      }) : [{
                        label: "Food & Drinks",
                        value: null,
                        total: "-",
                      }]),
                    ];

                    return summaryItems.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-3 gap-4 items-center text-sm"
                      >
                        <span className="font-bold text-black">{item.label}</span>
                        <span className="text-black break-words">
                          {item.value || "-"}
                        </span>
                        <span className="text-right font-semibold text-black">
                          {item.total || "-"}
                        </span>
                      </div>
                    ));
                  })()}
                </div>

                {bookingDetails.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                    <span className="font-bold text-black">Notes:</span>
                    <p className="text-black whitespace-pre-wrap mt-1">
                      {bookingDetails.notes}
                    </p>
                  </div>
                )}

                {/* Reward Information */}
                {bookingDetails.rewardInfo && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎁</span>
                        <span className="font-bold text-green-800">Reward Applied!</span>
                      </div>
                      <span className="text-green-600 font-bold">
                        -{new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(bookingDetails.rewardInfo.discountAmount).replace(/\s/g, "")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <span className="font-bold text-lg text-black">Subtotal</span>
                  <span className="font-bold text-lg text-brand-gold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(bookingDetails.subtotal || 0).replace(/\s/g, "")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mb-6">
            {/* Collapsed Header Only */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="flex justify-between items-center p-4">
                <h2 className="font-minecraft text-2xl text-brand-gold">
                  Booking Summary
                </h2>
                <button
                  className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100 transition-colors"
                  onClick={handleToggleBookingSummary}
                  aria-label="Show booking summary"
                >
                  <IoIosArrowDown size={24} className="text-brand-gold" />
                </button>
              </div>
            </div>
          </div>
        )}
        <BookingNavigator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          bookingDetails={bookingDetails}
        />
      </div>

      <div className="mt-8 w-full">
        {currentStep === 1 && (
          <div>
            <ConsoleSelection
              onSelectConsole={handleSelectConsole}
              selectedConsole={
                bookingDetails.console ? { name: bookingDetails.console } : null
              }
            />
            {bookingDetails.console && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleNextToStep2}
                  className="btn w-full bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft tracking-wider text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Next Step →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-center gap-4 mb-8">
              <label
                htmlFor="people-select"
                className="text-2xl font-semibold text-theme-primary flex items-center gap-2"
              >
                <IoMdPeople /> Number of People :
              </label>
              <select
                id="people-select"
                className={`select select-bordered border-brand-gold focus:border-brand-gold focus:outline-none ${bookingDetails.rewardInfo ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                  }`}
                value={bookingDetails.numberOfPeople || ""}
                onChange={(e) =>
                  !bookingDetails.rewardInfo && setBookingDetails((prev) => ({
                    ...prev,
                    numberOfPeople: e.target.value ? parseInt(e.target.value) : null,
                    roomType: null,
                    psUnit: null,
                    selectedGames: [],
                    unitPrice: 0,
                  }))
                }
                disabled={!!bookingDetails.rewardInfo}
              >
                <option value="" disabled>
                  Select number of people
                </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i > 0 ? "People" : "Person"}
                  </option>
                ))}
              </select>
            </div>

            {bookingDetails.numberOfPeople ? (
              <>
                <RoomTypeSelection
                  rooms={filteredRooms}
                  selectedRoomType={bookingDetails.roomType}
                  onSelectRoomType={handleSelectRoomType}
                  isReward={!!bookingDetails.rewardInfo}
                />
                {bookingDetails.roomType && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <label
                      htmlFor="ps-unit-select"
                      className="text-2xl font-semibold text-theme-primary flex items-center gap-2"
                    >
                      PS Unit Selection :
                    </label>
                    <select
                      id="ps-unit-select"
                      className={`select select-bordered ${bookingDetails.rewardInfo ? 'cursor-not-allowed opacity-70' : ''
                        }`}
                      value={bookingDetails.psUnit?.id || ""}
                      onChange={!bookingDetails.rewardInfo ? handlePsUnitChange : () => { }}
                      disabled={unitsStatus === "loading" || !!bookingDetails.rewardInfo}
                    >
                      <option disabled value="">
                        {unitsStatus === "loading"
                          ? "Loading units..."
                          : filteredUnits.length === 0
                            ? "No units available"
                            : "Pilih Unit"}
                      </option>
                      {filteredUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} - Rp{parseInt(unit.price).toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {bookingDetails.psUnit && (
                  <div>
                    <GameSelectionUnit
                      unitName={bookingDetails.psUnit.name}
                      availableGames={bookingDetails.psUnit.games || []}
                      selectedGame={bookingDetails.selectedGames[0]}
                      onSelectGame={handleSelectGame}
                    />
                    {bookingDetails.selectedGames.length > 0 && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={handleNextToStep3}
                          className="btn w-full bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft tracking-wider text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Next Step →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Please Select Number of People First
                </h3>
                <p className="text-gray-500">
                  Choose how many people will be using the room to see available options
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full">
            {/* Date and Time Selection Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Date Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-2xl font-minecraft text-black mb-4 text-center">
                  📅 Choose Date
                </h3>
                <DateSelection
                  unitId={bookingDetails.psUnit?.id}
                  selectedDate={bookingDetails.date}
                  onDateSelect={handleSelectDate}
                />
              </div>

              {/* Time Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-2xl font-minecraft text-black mb-4 text-center">
                  ⏰ Choose Time
                </h3>
                {bookingDetails.date ? (
                  <TimeSelection
                    selectedTime={bookingDetails.startTime}
                    onTimeSelect={handleSelectTime}
                    selectedDate={bookingDetails.date}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📅</div>
                      <p className="text-lg font-medium">Please select a date first</p>
                      <p className="text-sm">Choose a date to see available time slots</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Duration and Next Step */}
            {(bookingDetails.startTime || bookingDetails.rewardInfo) && (
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  {/* Duration Selection - Full Width */}
                  <div className="w-full mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-4">
                      <label
                        htmlFor="duration-select"
                        className="text-2xl font-semibold text-black flex items-center gap-2"
                      >
                        <FaClock /> Duration :
                        {bookingDetails.rewardInfo && (
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
                            🎁 From Reward
                          </span>
                        )}
                      </label>
                      <select
                        id="duration-select"
                        className={`select select-bordered select-lg min-w-[200px] bg-white border-gray-300 text-black focus:border-brand-gold ${bookingDetails.rewardInfo ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                          }`}
                        value={bookingDetails.duration || ""}
                        onChange={!bookingDetails.rewardInfo ? handleDurationChange : () => {
                          console.log("RentPage - Duration change blocked for reward");
                        }}
                        disabled={durationsLoading || availableDurations.length === 0 || !!bookingDetails.rewardInfo}
                        onFocus={() => {
                          console.log("RentPage - Duration dropdown focused");
                          console.log("RentPage - Current duration:", bookingDetails.duration);
                          console.log("RentPage - Available durations:", availableDurations);
                          console.log("RentPage - Is reward:", !!bookingDetails.rewardInfo);
                        }}
                      >
                        <option value="">
                          {durationsLoading ? "Loading durations..." : "Select Duration"}
                        </option>
                        {availableDurations.map((duration) => (
                          <option key={duration} value={duration} className="bg-white text-black">
                            {duration} {duration > 1 ? "Hours" : "Hour"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration Info */}
                    <div className="text-center text-sm text-gray-600 mt-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-medium text-blue-800 mb-1">
                          ⏰ Operating Hours
                        </p>
                        <p className="text-blue-700 text-xs mb-2">
                          Mon-Thu: 10:00-00:00 | Fri: 14:00-01:00 | Sat: 10:00-01:00 | Sun: 10:00-00:00
                        </p>
                        {(bookingDetails.startTime || bookingDetails.rewardInfo) && (
                          <p className="text-blue-700">
                            {bookingDetails.startTime && (
                              <>Waktu yang dipilih: <span className="font-semibold">{bookingDetails.startTime}</span></>
                            )}
                            {bookingDetails.duration && (
                              <>
                                {bookingDetails.startTime && " • "}Durasi: <span className="font-semibold">{bookingDetails.duration} jam</span>
                                {bookingDetails.rewardInfo && (
                                  <span className="text-green-600"> (From Reward)</span>
                                )}
                                {bookingDetails.startTime && (() => {
                                  const startHour = parseInt(bookingDetails.startTime.split(':')[0], 10);
                                  const startMinute = parseInt(bookingDetails.startTime.split(':')[1], 10);
                                  const endHour = startHour + bookingDetails.duration;
                                  const endTime = endHour >= 24
                                    ? `${String(endHour - 24).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} (+1 day)`
                                    : `${String(endHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
                                  return (
                                    <> • Berakhir pada: <span className="font-semibold">{endTime}</span></>
                                  );
                                })()}
                              </>
                            )}
                            {durationsLoading && (
                              <> • <span className="text-blue-600">Loading available durations...</span></>
                            )}
                            {!durationsLoading && availableDurations.length === 0 && bookingDetails.startTime && (
                              <> • <span className="text-red-600">No durations available for this time</span></>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Next Step Button - Centered */}
                  {bookingDetails.duration && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleNextToStep4}
                        className="btn w-full bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft tracking-wider text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Next Step →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <FoodAndDrinksSelection
            selections={bookingDetails.foodAndDrinks}
            onSelectionChange={handleFnbChange}
            onNextStep={handleFinalizeBooking}
          />
        )}
      </div>
    </div>
  );
};

export default RentPage;
