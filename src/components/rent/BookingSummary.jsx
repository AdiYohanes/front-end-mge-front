import React from "react";
import { IoClose } from "react-icons/io5";

const formatPrice = (price) => {
  if (price === 0 || !price) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const BookingSummary = ({
  details,
  isPaymentPage = false,
  promoCode,
  onPromoChange,
  onApplyPromo,
  isPromoLoading = false,
  taxInfo = null,
  serviceFees = [],
}) => {
  const formattedDate = details.date
    ? new Date(details.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const fnbValue =
    details.foodAndDrinks?.length > 0
      ? details.foodAndDrinks
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ")
      : null;

  const fnbTotal = details.foodAndDrinks?.reduce((total, item) => {
    return total + parseInt(item.price, 10) * item.quantity;
  }, 0);

  const summaryItems = [
    {
      label: "Console",
      value: details.console,
      quantity: details.console ? 1 : "-",
    },
    {
      label: "Room Type",
      value: details.roomType?.name,
      quantity: details.roomType ? 1 : "-",
    },
    {
      label: "PS Unit",
      value: details.psUnit?.name,
      quantity: details.psUnit ? 1 : "-",
      total: details.psUnit ? formatPrice(details.unitPrice) : "-",
    },
    {
      label: "Game",
      value: details.selectedGames[0]?.title,
      quantity:
        details.selectedGames.length > 0 ? details.selectedGames.length : "-",
    },
    { label: "Date", value: formattedDate, quantity: "-" },
    {
      label: "Start Time",
      value: details.startTime,
      quantity: details.startTime ? 1 : "-",
    },
    {
      label: "Duration",
      value: details.duration ? `${details.duration} Hour(s)` : null,
      quantity: "-",
    },
    {
      label: "Food & Drinks",
      value: fnbValue,
      quantity:
        details.foodAndDrinks?.length > 0
          ? details.foodAndDrinks.reduce((acc, item) => acc + item.quantity, 0)
          : "-",
      total: fnbTotal > 0 ? formatPrice(fnbTotal) : "-",
    },
  ];

  const baseSubtotal = details.subtotal || 0;
  // Only apply tax if there are food and drinks orders
  const hasFoodOrDrinks = details.foodAndDrinks?.length > 0;
  const taxPercentage = isPaymentPage && taxInfo?.is_active && hasFoodOrDrinks ? Number(taxInfo.percentage) || 0 : 0;
  const taxAmount = baseSubtotal * (taxPercentage / 100);
  const activeServiceFees = Array.isArray(serviceFees)
    ? serviceFees.filter((f) => !!f?.is_active)
    : [];
  const serviceFeeTotal = isPaymentPage
    ? activeServiceFees.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
    : 0;
  const voucherDiscount = details.voucherDiscount || 0;
  const finalTotal = baseSubtotal + taxAmount + serviceFeeTotal - voucherDiscount;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-minecraft text-2xl text-brand-gold">
          Booking Summary
        </h2>
        <button className="btn btn-ghost btn-sm btn-circle">
          <IoClose size={24} />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-black mb-2">
          <span>Type</span>
          <span>Description</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Total</span>
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="mt-4 space-y-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-4 gap-4 items-center text-sm"
            >
              <span className="font-bold text-black">{item.label}</span>
              <span className="text-black truncate">
                {item.value || "-"}
              </span>
              <span className="text-center text-black">{item.quantity}</span>
              <span className="text-right font-semibold text-black">
                {item.total || "-"}
              </span>
            </div>
          ))}
        </div>

        {details.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
            <span className="font-bold text-black">Notes:</span>
            <p className="text-black whitespace-pre-wrap mt-1">
              {details.notes}
            </p>
          </div>
        )}

        {isPaymentPage ? (
          <>
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Subtotal</span>
                <span className="font-semibold text-black">
                  {formatPrice(baseSubtotal)}
                </span>
              </div>
              {taxPercentage > 0 && (
                <div className="flex justify-between">
                  <span className="text-black">{taxInfo?.name} {taxPercentage}%</span>
                  <span className="font-semibold text-black">{formatPrice(taxAmount)}</span>
                </div>
              )}
              {activeServiceFees.map((fee) => (
                <div key={fee.id} className="flex justify-between">
                  <span className="text-black">{fee.name}</span>
                  <span className="font-semibold text-black">{formatPrice(parseFloat(fee.amount) || 0)}</span>
                </div>
              ))}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Voucher "{details.voucherCode}" ({details.promoPercentage}%)</span>
                  <span className="font-semibold">
                    -{formatPrice(voucherDiscount)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-300">
              <span className="font-bold text-lg text-black">Total</span>
              <span className="font-bold text-xl text-brand-gold">
                {formatPrice(finalTotal)}
              </span>
            </div>
            <div className="mt-6">
              <label
                htmlFor="promo-code"
                className="text-sm font-semibold mb-2 block text-black"
              >
                Got any promo code?
              </label>
              <div className="join w-full">
                <input
                  id="promo-code"
                  type="text"
                  placeholder="ex: OPENINGYUK"
                  className="input input-bordered join-item w-full bg-white text-black border-gray-300 focus:border-brand-gold"
                  value={promoCode}
                  onChange={onPromoChange}
                  disabled={isPromoLoading}
                />
                <button
                  onClick={onApplyPromo}
                  disabled={isPromoLoading || !promoCode.trim()}
                  className="btn join-item bg-brand-gold text-white hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isPromoLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <span className="font-bold text-lg text-black">Subtotal</span>
            <span className="font-bold text-lg text-brand-gold">
              {formatPrice(details.subtotal)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
