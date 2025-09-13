import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { FaCheckCircle, FaShoppingBag, FaHome, FaHistory } from "react-icons/fa";

const FoodDrinksSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        // Get order details from location state (preferred) or URL params (fallback)
        const stateData = location.state;
        const invoiceNumber = stateData?.invoice_number || searchParams.get('invoice_number');
        const totalPrice = stateData?.total_price || searchParams.get('total_price');
        const isReward = stateData?.is_reward || searchParams.get('is_reward') === 'true';
        const seating = stateData?.seating || searchParams.get('seating');
        const bookingData = stateData?.bookingData;

        console.log("FoodDrinksSuccessPage - Data received:", {
            stateData,
            invoiceNumber,
            totalPrice,
            isReward,
            seating,
            bookingData
        });

        console.log("FoodDrinksSuccessPage - Condition check:", {
            hasInvoiceNumber: !!invoiceNumber,
            invoiceNumberValue: invoiceNumber,
            hasTotalPrice: totalPrice !== null,
            totalPriceValue: totalPrice,
            willSetOrderDetails: !!(invoiceNumber && totalPrice !== null)
        });

        if (invoiceNumber && totalPrice !== null && totalPrice !== undefined) {
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
                // Use booking data from API response if available
                fnbItems: bookingData?.fnbs || [],
                status: bookingData?.status || 'pending',
                notes: bookingData?.notes || 'F&B Only Order'
            });
        } else {
            // Fallback: Set orderDetails even if conditions are not met
            console.warn("FoodDrinksSuccessPage - Conditions not met, setting fallback data");
            const now = new Date();
            setOrderDetails({
                invoiceNumber: invoiceNumber || 'N/A',
                totalPrice: totalPrice !== null && totalPrice !== undefined ? parseFloat(totalPrice) : 0,
                isReward: isReward || false,
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
                fnbItems: bookingData?.fnbs || [],
                status: bookingData?.status || 'pending',
                notes: bookingData?.notes || 'F&B Only Order'
            });
        }
    }, [searchParams, location.state]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(price)
            .replace(/\s/g, "");

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
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
                        <h1 className="text-4xl lg:text-5xl font-minecraft text-gray-900 dark:text-white mb-4">
                            <span className="text-black dark:text-white">Order </span>
                            <span className="text-brand-gold">Successful!</span>
                        </h1>
                        <div className="flex items-center gap-3 justify-center mb-6">
                            <div className="h-3 w-3 bg-brand-gold"></div>
                            <div className="h-3 w-3 bg-black dark:bg-white"></div>
                            <div className="h-3 w-3 bg-brand-gold"></div>
                        </div>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Your food & drinks order has been placed successfully. We'll prepare your order and notify you when it's ready!
                        </p>
                    </div>

                    {/* Order Details */}
                    {orderDetails && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-12">
                            <h2 className="font-minecraft text-2xl text-brand-gold mb-6 text-center">
                                Order Details
                            </h2>
                            {/* Order Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Invoice Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm">
                                        {orderDetails.invoiceNumber}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Order Date</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {orderDetails.orderDate}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Payment Method</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {orderDetails.paymentMethod}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${orderDetails.isReward || orderDetails.status === 'success' || orderDetails.status === 'completed'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                        : orderDetails.status === 'pending'
                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {orderDetails.isReward ? 'Success' :
                                            orderDetails.status === 'success' || orderDetails.status === 'completed' ? 'Success' :
                                                orderDetails.status === 'pending' ? 'Pending Payment' :
                                                    orderDetails.status || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Order Summary</h3>
                                    <span className="font-bold text-brand-gold text-2xl">
                                        {formatPrice(orderDetails.totalPrice)}
                                    </span>
                                </div>

                                {orderDetails.seating && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">Seating:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {orderDetails.seating}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">Order Type:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        Food & Drinks
                                    </span>
                                </div>
                            </div>

                            {/* F&B Items from API Response */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Items Ordered</h3>
                                {orderDetails.fnbItems && orderDetails.fnbItems.length > 0 ? (
                                    <div className="space-y-3">
                                        {orderDetails.fnbItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.pivot?.quantity || 0}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-brand-gold text-lg">
                                                        {formatPrice(parseFloat(item.pivot?.price || item.price) * (item.pivot?.quantity || 0))}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatPrice(parseFloat(item.pivot?.price || item.price))} each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                            <span>Food & Drinks items will be prepared</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                            <span>Fresh ingredients and quality service</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                                            <span>Estimated preparation time: 15-30 minutes</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-12">
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
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Order Processing</p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Our team will prepare your food & drinks order with care
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Ready for Pickup</p>
                                            <p className="text-gray-600 dark:text-gray-300">
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
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Complete Payment</p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                You will be redirected to our payment gateway to complete your payment
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Order Processing</p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Our team will prepare your food & drinks order with care
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-white text-sm font-bold">3</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Ready for Pickup</p>
                                            <p className="text-gray-600 dark:text-gray-300">
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
                            onClick={() => navigate("/")}
                            className="btn btn-outline border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white btn-lg px-8 py-3 font-medium"
                        >
                            <FaHome className="w-5 h-5 mr-2" />
                            Back to Home
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
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Contact Information */}
                            <div className="text-center md:text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Need Help?</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Email:</span>{" "}
                                        <a href="mailto:support@gamingrental.com" className="text-brand-gold hover:underline font-medium">
                                            support@gamingrental.com
                                        </a>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Phone:</span>{" "}
                                        <a href="tel:+6281234567890" className="text-brand-gold hover:underline font-medium">
                                            +62 812-3456-7890
                                        </a>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">WhatsApp:</span>{" "}
                                        <a href="https://wa.me/6281234567890" className="text-brand-gold hover:underline font-medium">
                                            +62 812-3456-7890
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="text-center md:text-right">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Order Reference</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Keep this page safe</span> for your records
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
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