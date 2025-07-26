// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import gamesReducer from "../features/games/gamesSlice";
import faqsReducer from "../features/faqs/faqsSlice";
import consolesReducer from "../features/consoles/consolesSlice";
import roomsReducer from "../features/rooms/roomsSlice";
import unitsReducer from "../features/units/unitsSlice";
import availabilityReducer from "../features/availability/availabilitySlice";
import fnbsReducer from "../features/fnbs/fnbsSlice";
import bookingReducer from "../features/booking/bookingSlice";
import historyReducer from "../features/history/historySlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    faqs: faqsReducer,
    consoles: consolesReducer,
    rooms: roomsReducer,
    units: unitsReducer,
    availability: availabilityReducer,
    fnbs: fnbsReducer,
    booking: bookingReducer,
    history: historyReducer,
  },
});
