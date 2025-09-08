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
            const now = new Date();
            setOrderDetails({
                invoiceNumber,
                totalPrice: parseFloat(totalPrice),
                isReward: isReward,
                seating: seating || null,
                orderDate: now.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                orderTime: now.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                paymentMethod: isReward ? '🎁 Reward Points' : '💳 Online Payment',
                orderId: `ORD-${invoiceNumber.slice(-6)}`
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
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 lg:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-8">
                            <img
                                src="/images/success.png"
                                alt="Success"
                                className="h-40 w-auto"
                            />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-900 mb-4">
                            <span className="text-black">Order </span>
                            <span className="text-brand-gold">Successful!</span>
                        </h1>
                        <div className="flex items-center gap-3 justify-center mb-6">
                            <div className="h-3 w-3 bg-brand-gold"></div>
                            <div className="h-3 w-3 bg-black"></div>
                            <div className="h-3 w-3 bg-brand-gold"></div>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Your food & drinks order has been placed successfully. We'll prepare your order and notify you when it's ready!
                        </p>
                    </div>

                    {/* Order Details */}
                    {orderDetails && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
                            <h2 className="font-minecraft text-2xl text-brand-gold mb-6 text-center">
                                Order Details
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Order Information */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Order Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Order ID:</span>
                                                <span className="font-semibold text-gray-900 font-mono text-sm">
                                                    {orderDetails.orderId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Invoice Number:</span>
                                                <span className="font-semibold text-gray-900 font-mono text-sm">
                                                    {orderDetails.invoiceNumber}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Order Date:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {orderDetails.orderDate}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Order Time:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {orderDetails.orderTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Payment & Status</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Payment Method:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {orderDetails.paymentMethod}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Status:</span>
                                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${orderDetails.isReward
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {orderDetails.isReward ? 'Success' : 'Pending Payment'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Order Summary */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Order Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Total Amount:</span>
                                                <span className="font-bold text-brand-gold text-xl">
                                                    {formatPrice(orderDetails.totalPrice)}
                                                </span>
                                            </div>
                                            {orderDetails.seating && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Seating:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {orderDetails.seating}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Order Type:</span>
                                                <span className="font-semibold text-gray-900">
                                                    Food & Drinks
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* F&B Items Preview */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Items Ordered</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                                <span>Food & Drinks items will be prepared</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                                <span>Fresh ingredients and quality service</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                                <span>Estimated preparation time: 15-30 minutes</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
                        <h3 className="font-minecraft text-2xl text-brand-gold mb-6 text-center">
                            What's Next?
                        </h3>
                        <div className="space-y-6">
                            {orderDetails?.isReward ? (
                                // Steps for reward booking (no payment needed)
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">1</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-semibold text-lg mb-2">Order Processing</p>
                                            <p className="text-gray-600">
                                                Our team will prepare your food & drinks order with care
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-semibold text-lg mb-2">Ready for Pickup</p>
                                            <p className="text-gray-600">
                                                Your order will be ready at the specified time and location
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Steps for normal booking (payment needed)
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">1</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-semibold text-lg mb-2">Complete Payment</p>
                                            <p className="text-gray-600">
                                                You will be redirected to our payment gateway to complete your payment
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-semibold text-lg mb-2">Order Processing</p>
                                            <p className="text-gray-600">
                                                Our team will prepare your food & drinks order with care
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">3</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-semibold text-lg mb-2">Ready for Pickup</p>
                                            <p className="text-gray-600">
                                                Your order will be ready at the specified time and location
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/book-history")}
                            className="btn btn-outline border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white btn-lg px-8 py-3 font-medium"
                        >
                            <FaHistory className="w-5 h-5 mr-2" />
                            See Booking History
                        </button>
                        <button
                            onClick={() => navigate("/food-drinks")}
                            className="btn bg-brand-gold hover:bg-brand-gold/80 text-white btn-lg px-8 py-3 font-medium"
                        >
                            <FaShoppingBag className="w-5 h-5 mr-2" />
                            Order More
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Contact Information */}
                            <div className="text-center md:text-left">
                                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Need Help?</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Email:</span>{" "}
                                        <a href="mailto:support@gamingrental.com" className="text-brand-gold hover:underline font-medium">
                                            support@gamingrental.com
                                        </a>
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Phone:</span>{" "}
                                        <a href="tel:+6281234567890" className="text-brand-gold hover:underline font-medium">
                                            +62 812-3456-7890
                                        </a>
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">WhatsApp:</span>{" "}
                                        <a href="https://wa.me/6281234567890" className="text-brand-gold hover:underline font-medium">
                                            +62 812-3456-7890
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="text-center md:text-right">
                                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Order Reference</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Keep this page safe</span> for your records
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Order ID:</span>{" "}
                                        <span className="font-mono text-brand-gold font-semibold">
                                            {orderDetails?.orderId || 'N/A'}
                                        </span>
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Invoice:</span>{" "}
                                        <span className="font-mono text-brand-gold font-semibold">
                                            {orderDetails?.invoiceNumber || 'N/A'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDrinksSuccessPage; 