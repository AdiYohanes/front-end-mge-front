import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
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

// Import Ikon
import { IoMdPeople } from "react-icons/io";
import { FaClock } from "react-icons/fa";

const RentPage = () => {
  const [bookingDetails, setBookingDetails] = useState({
    console: null,
    roomType: null,
    psUnit: null,
    unitPrice: 0,
    selectedGames: [],
    date: new Date(),
    startTime: null,
    duration: 1,
    foodAndDrinks: [],
    notes: "",
    subtotal: 0,
    numberOfPeople: 1,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const pageRef = useRef(null);

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

  // Menghitung subtotal secara otomatis
  useEffect(() => {
    const basePrice =
      (bookingDetails.unitPrice || 0) * (bookingDetails.duration || 0);
    const fnbTotal = bookingDetails.foodAndDrinks.reduce((total, item) => {
      return total + parseInt(item.price, 10) * item.quantity;
    }, 0);
    const newSubtotal = basePrice + fnbTotal;
    setBookingDetails((prev) => ({ ...prev, subtotal: newSubtotal }));
  }, [
    bookingDetails.unitPrice,
    bookingDetails.duration,
    bookingDetails.foodAndDrinks,
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
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
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
    const selectedUnitObject = units.find((unit) => unit.id === selectedUnitId);
    setBookingDetails((prev) => ({
      ...prev,
      psUnit: selectedUnitObject,
      unitPrice: parseInt(selectedUnitObject.price, 10),
      selectedGames: [],
    }));
  };

  const handleSelectGame = (game) => {
    setBookingDetails((prev) => ({ ...prev, selectedGames: [game] }));
    setTimeout(() => {
      setCurrentStep(3);
    }, 300);
  };

  const handleSelectDate = (date) => {
    setBookingDetails((prev) => ({
      ...prev,
      date: date,
      startTime: null,
      duration: 1,
    }));
  };

  const handleSelectTime = (time) => {
    setBookingDetails((prev) => ({ ...prev, startTime: time }));
  };

  const handleDurationChange = (e) => {
    setBookingDetails((prev) => ({
      ...prev,
      duration: parseInt(e.target.value, 10),
    }));
  };

  const handleNextToStep4 = () => {
    setTimeout(() => {
      setCurrentStep(4);
    }, 300);
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
    if (user) {
      // User is logged in, proceed to payment page
      navigate("/booking-payment", { state: { bookingDetails } });
    } else {
      // User is not logged in, proceed to guest booking page
      navigate("/booking-payment", {
        state: {
          bookingDetails,
          isGuestBooking: true
        }
      });
    }
  };

  const filteredRooms = allRooms.filter(
    (room) => room.max_visitors >= bookingDetails.numberOfPeople
  );

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex flex-col items-center">
      <div ref={pageRef} className="flex flex-col items-center w-full">
        <h1 className="text-4xl lg:text-5xl font-minecraft mb-6 text-theme-primary">
          Book an Appointment
        </h1>
        <div className="flex items-center gap-2 mb-12">
          <div className="h-3 w-3 bg-black"></div>
          <div className="h-3 w-3 bg-primary"></div>
          <div className="h-3 w-3 bg-black"></div>
        </div>
        <BookingSummary details={bookingDetails} />
        <BookingNavigator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="mt-8 w-full">
        {currentStep === 1 && (
          <ConsoleSelection
            onSelectConsole={handleSelectConsole}
            selectedConsole={
              bookingDetails.console ? { name: bookingDetails.console } : null
            }
          />
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
                className="select select-bordered select-primary"
                value={bookingDetails.numberOfPeople}
                onChange={(e) =>
                  setBookingDetails((prev) => ({
                    ...prev,
                    numberOfPeople: parseInt(e.target.value),
                    roomType: null,
                    psUnit: null,
                    selectedGames: [],
                    unitPrice: 0,
                  }))
                }
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i > 0 ? "People" : "Person"}
                  </option>
                ))}
              </select>
            </div>
            <RoomTypeSelection
              rooms={filteredRooms}
              selectedRoomType={bookingDetails.roomType}
              onSelectRoomType={handleSelectRoomType}
            />
            {bookingDetails.roomType && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <label
                  htmlFor="ps-unit-select"
                  className="text-2xl font-semibold text-theme-primary"
                >
                  PS Unit Selection :
                </label>
                <select
                  id="ps-unit-select"
                  className="select select-bordered"
                  value={bookingDetails.psUnit?.id || ""}
                  onChange={handlePsUnitChange}
                  disabled={unitsStatus === "loading"}
                >
                  <option disabled value="">
                    {unitsStatus === "loading"
                      ? "Loading units..."
                      : "Pilih Unit"}
                  </option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {bookingDetails.psUnit && (
              <GameSelectionUnit
                unitName={bookingDetails.psUnit.name}
                availableGames={bookingDetails.psUnit.games}
                selectedGame={bookingDetails.selectedGames[0]}
                onSelectGame={handleSelectGame}
              />
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full">
            {/* Date and Time Selection Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Date Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-2xl font-minecraft text-theme-primary mb-4 text-center">
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
                <h3 className="text-2xl font-minecraft text-theme-primary mb-4 text-center">
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
            {bookingDetails.startTime && (
              <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Duration Selection */}
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <label
                          htmlFor="duration-select"
                          className="text-2xl font-semibold text-theme-primary flex items-center gap-2"
                        >
                          <FaClock /> Duration :
                        </label>
                        <select
                          id="duration-select"
                          className="select select-bordered select-lg"
                          value={bookingDetails.duration}
                          onChange={handleDurationChange}
                        >
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i > 0 ? "Hours" : "Hour"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-theme-secondary text-center">
                        *Default booking duration is{" "}
                        <span className="font-bold">1 hour</span>.<br />
                        Every additional hour will cost{" "}
                        <span className="font-bold">Rp5.000/hour</span>.
                      </p>
                    </div>

                    {/* Next Step Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={handleNextToStep4}
                        className="btn bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft tracking-wider text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>
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
