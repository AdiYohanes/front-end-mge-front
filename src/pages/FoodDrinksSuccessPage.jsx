import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FaCheckCircle, FaShoppingBag, FaHome, FaHistory } from "react-icons/fa";

const FoodDrinksSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        // Get order details from URL params or localStorage
        const invoiceNumber = searchParams.get('invoice_number');
        const totalPrice = searchParams.get('total_price');
        const isReward = searchParams.get('is_reward') === 'true';
        const seating = searchParams.get('seating');

        if (invoiceNumber && totalPrice !== null) {
            setOrderDetails({
                invoiceNumber,
                totalPrice: parseFloat(totalPrice),
                isReward: isReward,
                seating: seating || null
            });
        }
    }, [searchParams]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(price)
            .replace(/\s/g, "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-gold/10 to-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-minecraft text-gray-900 mb-2">
                            Order Successful!
                        </h1>
                        <p className="text-gray-600">
                            Your food & drinks order has been placed successfully
                        </p>
                    </div>

                    {/* Order Details */}
                    {orderDetails && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="font-minecraft text-xl text-brand-gold mb-4">
                                Order Details
                            </h2>
                            <div className="space-y-3 text-left">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Invoice Number:</span>
                                    <span className="font-semibold text-gray-900">
                                        {orderDetails.invoiceNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-brand-gold text-lg">
                                        {formatPrice(orderDetails.totalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderDetails.isReward
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {orderDetails.isReward ? 'Success' : 'Pending Payment'}
                                    </span>
                                </div>
                                {orderDetails.seating && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Seating:</span>
                                        <span className="font-semibold text-gray-900">
                                            {orderDetails.seating}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="mb-8">
                        <h3 className="font-minecraft text-lg text-gray-900 mb-4">
                            What's Next?
                        </h3>
                        <div className="space-y-3 text-left">
                            {orderDetails?.isReward ? (
                                // Steps for reward booking (no payment needed)
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Order Processing</p>
                                            <p className="text-gray-600 text-sm">
                                                Our team will prepare your food & drinks order
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Ready for Pickup</p>
                                            <p className="text-gray-600 text-sm">
                                                Your order will be ready at the specified time and location
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Steps for normal booking (payment needed)
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Complete Payment</p>
                                            <p className="text-gray-600 text-sm">
                                                You will be redirected to our payment gateway to complete your payment
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Order Processing</p>
                                            <p className="text-gray-600 text-sm">
                                                Our team will prepare your food & drinks order
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Ready for Pickup</p>
                                            <p className="text-gray-600 text-sm">
                                                Your order will be ready at the specified time and location
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="btn btn-outline btn-lg flex-1 gap-2"
                        >
                            <FaHome className="w-4 h-4" />
                            Back to Home
                        </button>
                        <button
                            onClick={() => navigate("/booking-history")}
                            className="btn bg-brand-gold hover:bg-brand-gold/80 text-white btn-lg flex-1 gap-2"
                        >
                            <FaHistory className="w-4 h-4" />
                            View Orders
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Need help? Contact us at{" "}
                            <a href="mailto:support@gamingrental.com" className="text-brand-gold hover:underline">
                                support@gamingrental.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDrinksSuccessPage; 