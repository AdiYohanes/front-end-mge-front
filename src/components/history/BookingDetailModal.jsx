// src/components/history/BookingDetailModal.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearSelectedBooking } from "../../features/history/historySlice";
import { format } from "date-fns";
import { IoClose } from "react-icons/io5";

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const BookingDetailModal = () => {
  const dispatch = useDispatch();
  const { selectedBookingDetail, detailStatus } = useSelector(
    (state) => state.history
  );

  if (!selectedBookingDetail && detailStatus !== "loading") return null;

  const booking = selectedBookingDetail;
  const bookingDate = booking
    ? format(new Date(booking.start_time || booking.created_at), "eeee, dd MMMM yyyy")
    : "";

  const renderContent = () => {
    if (detailStatus === "loading") {
      return (
        <div className="text-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }
    if (detailStatus === "succeeded" && booking) {
      // Calculate subtotal (total_price - service_fee - tax)
      const serviceFee = parseFloat(booking.service_fee_amount || 0);
      const taxAmount = parseFloat(booking.tax_amount || 0);
      const subtotal = parseFloat(booking.total_price) - serviceFee - taxAmount;

      return (
        <>
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-minecraft text-3xl text-brand-gold">
                Booking Summary
              </h2>
              <p className="font-semibold">{bookingDate}</p>
            </div>
            <div className="divider"></div>
            {/* Detail Utama */}
            <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-500">
              <span>Type</span>
              <span>Description</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>
            <div className="space-y-3 text-sm">
              {booking.unit && (
                <>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="font-bold">Console</span>
                    <span>{booking.unit.consoles?.[0]?.name || "N/A"}</span>
                    <span className="text-center">1</span>
                    <span className="text-right">-</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="font-bold">Room Type</span>
                    <span>
                      {booking.unit?.name || 'N/A'} ({booking.total_visitors || 1})
                    </span>
                    <span className="text-center">1</span>
                    <span className="text-right">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="font-bold">Duration</span>
                    <span>
                      {booking.start_time ? format(new Date(booking.start_time), "HH:mm") : "N/A"} -{" "}
                      {booking.end_time ? format(new Date(booking.end_time), "HH:mm") : "N/A"}
                    </span>
                    <span className="text-center">{booking.duration || 1}</span>
                    <span className="text-right">-</span>
                  </div>
                </>
              )}
              {!booking.unit && (
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="font-bold">Order Type</span>
                  <span>Food & Drinks Only</span>
                  <span className="text-center">1</span>
                  <span className="text-right">{formatPrice(subtotal)}</span>
                </div>
              )}
              {booking.fnbs.length > 0 && (
                <div className="grid grid-cols-4 gap-4 items-start pt-2">
                  <span className="font-bold">Food & Drinks</span>
                  <div className="col-span-3">
                    {booking.fnbs.map((fnb) => (
                      <div key={fnb.id} className="grid grid-cols-3 gap-4">
                        <span>{fnb.name}</span>
                        <span className="text-center">
                          {fnb.pivot.quantity}
                        </span>
                        <span className="text-right">
                          {formatPrice(fnb.pivot.quantity * fnb.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Kalkulasi Total */}
            <div className="mt-6 pt-4 border-t-2 border-base-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Service Fee</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Tax (PPN 10%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand-gold">
                  {formatPrice(parseFloat(booking.total_price))}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-base-200 text-right">
            <button
              onClick={() => dispatch(clearSelectedBooking())}
              className="btn bg-brand-gold hover:bg-brand-gold/80 text-white"
            >
              Close
            </button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
export default BookingDetailModal;
