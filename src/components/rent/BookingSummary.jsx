import React from "react";
import { IoClose } from "react-icons/io5";

const formatPrice = (price) => {
  if (price === 0 || !price) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price).replace(/\s/g, "");
};

const BookingSummary = ({
  details,
  isPaymentPage = false,
  promoCode,
  onPromoChange,
  onApplyPromo,
  onRemovePromo,
  isPromoLoading = false,
  taxInfo = null,
  serviceFees = [],
  onClose = null,
}) => {
  const formattedDate = details.date
    ? new Date(details.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const fnbItems = details.foodAndDrinks?.length > 0
    ? details.foodAndDrinks
    : [];

  const fnbTotal = details.foodAndDrinks?.reduce((total, item) => {
    return total + parseInt(item.price, 10) * item.quantity;
  }, 0);

  // Calculate unit total price (unit price * duration)
  const unitTotalPrice = details.psUnit && details.duration
    ? details.unitPrice * details.duration
    : 0;

  const summaryItems = [
    {
      label: "Console",
      value: details.console,
    },
    {
      label: "Room Type",
      value: details.roomType?.name,
    },
    {
      label: "PS Unit",
      value: details.psUnit ? `${details.psUnit.name} (${formatPrice(details.unitPrice)}/jam)` : "-",
      total: details.psUnit ? formatPrice(details.unitPrice) : "-",
    },
    {
      label: "Game",
      value: details.selectedGames[0]?.title,
    },
    {
      label: "Date",
      value: formattedDate
    },
    {
      label: "Start Time",
      value: details.startTime,
    },
    {
      label: "Duration",
      value: details.duration ? `${details.duration} Hour(s)` : null,
      total: unitTotalPrice > 0 ? formatPrice(unitTotalPrice) : "-",
    },
    ...(fnbItems.length > 0 ? fnbItems.map((item, index) => {
      const itemTotal = parseInt(item.price, 10) * item.quantity;
      return {
        label: index === 0 ? "Food & Drinks" : "",
        value: `${item.name} (x${item.quantity})`,
        total: formatPrice(itemTotal),
      };
    }) : [{
      label: "Food & Drinks",
      value: null,
      total: "-",
    }]),
  ];

  const baseSubtotal = details.subtotal || 0;
  // Only apply tax if there are food and drinks orders
  const hasFoodOrDrinks = details.foodAndDrinks?.length > 0;
  const taxPercentage = isPaymentPage && taxInfo?.is_active && hasFoodOrDrinks ? Number(taxInfo.percentage) || 0 : 0;

  // Calculate F&B subtotal for tax calculation
  const fnbSubtotal = details.foodAndDrinks?.reduce((total, item) => {
    return total + parseInt(item.price, 10) * item.quantity;
  }, 0) || 0;

  // Tax is calculated only from F&B subtotal, not from total booking
  const taxAmount = fnbSubtotal * (taxPercentage / 100);
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
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={onClose}
          disabled={!onClose}
        >
          <IoClose size={24} />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-black mb-2">
          <span>Type</span>
          <span>Description</span>
          <span className="text-right">Total</span>
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="mt-4 space-y-4">
          {summaryItems.map((item) => (
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
                  <span className="text-black">PB1 {taxPercentage}%</span>
                  <span className="font-semibold text-black">{formatPrice(taxAmount)}</span>
                </div>
              )}
              {activeServiceFees.map((fee) => (
                <div key={fee.id} className="flex justify-between">
                  <span className="text-black">Service Fee</span>
                  <span className="font-semibold text-black">{formatPrice(parseFloat(fee.amount) || 0)}</span>
                </div>
              ))}
              {voucherDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <div className="flex items-center gap-2">
                    <span>{details.voucherCode} ({details.promoPercentage}%)</span>
                    {onRemovePromo && (
                      <button
                        onClick={onRemovePromo}
                        className="btn btn-xs btn-ghost text-red-600 hover:bg-red-100 hover:text-red-700 p-1"
                        title="Remove promo code"
                      >
                        <IoClose className="w-3 h-3" />
                      </button>
                    )}
                  </div>
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
