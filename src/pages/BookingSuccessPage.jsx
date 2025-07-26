import React from "react";
import { Link, useLocation } from "react-router";
import { FaHistory, FaPlusCircle } from "react-icons/fa";

const BookingSuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const invoiceNumber =
    queryParams.get("invoice_number") || "BOOK-20250722-JNW502";

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24 flex justify-center">
      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        {/* 1. Gambar Sukses (Logo) lebih besar */}
        <img
          src="/images/success.png"
          alt="Success"
          className="h-48 w-auto mx-auto mb-4" // Ukuran diperbesar
        />

        {/* 2. Gambar & Poin sekarang di bawah logo */}
        <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <img
            src="/images/coin.png"
            alt="Points Earned"
            className="h-12 w-auto"
          />
          <div className="text-left">
            <p className="text-gray-500 text-sm">You've earned</p>
            <p className="text-2xl font-bold text-brand-gold">10 Points</p>
          </div>
        </div>

        {/* 3. Tulisan Sukses */}
        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-800 mb-4">
          Your booking has been made!
        </h1>

        {/* 5. Teks Konfirmasi */}
        <p className="max-w-md mx-auto text-gray-600 leading-relaxed mb-8">
          We will send you a confirmation and payment information through
          Whatsapp. Please sit tight!
        </p>

        {/* 4. Nomor Invoice */}
        <div className="mb-10 p-4 bg-base-200 rounded-lg inline-block">
          <span className="text-gray-500 text-sm">Invoice Number:</span>
          <p className="font-semibold text-lg tracking-wider">
            {invoiceNumber}
          </p>
        </div>

        {/* 6. Tombol Aksi */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
          <Link
            to="/history"
            className="btn btn-outline border-gray-300 w-full"
          >
            <FaHistory className="mr-2" />
            See booking history
          </Link>
          <Link to="/rent" className="btn bg-brand-gold text-white w-full">
            <FaPlusCircle className="mr-2" />
            Book another Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
