// src/pages/BookingCancelledPage.jsx
import React from "react";
import { Link } from "react-router";

const BookingCancelledPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
      <div className="w-full max-w-lg text-center flex flex-col items-center">
        <img
          src="/images/cancel.png"
          alt="Booking Cancelled"
          className="h-56 w-auto mx-auto mb-6"
        />
        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-800 mb-4">
          Your Booking has been cancelled.
        </h1>
        <p className="max-w-md mx-auto text-gray-600 leading-relaxed mb-10">
          We're sad to see you go, but we will meet another time!
          <br />
          If your payment does not go through, please try booking again
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
          <Link
            to="/book-history"
            className="btn btn-outline border-gray-300 w-full"
          >
            See Booking History
          </Link>
          <Link to="/rent" className="btn bg-brand-gold text-white w-full">
            Book Another Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelledPage;
