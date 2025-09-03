import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFnbsThunk, fetchFnbsCategoriesThunk, setSelectedCategory, bookFnbsThunk, resetBookingStatus } from "../features/fnbs/fnbsSlice";
import { FaPlus, FaMinus, FaShoppingCart, FaSearch } from "react-icons/fa";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import PersonalInfoForm from "../components/rent/PersonalInfoForm";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import publicApiClient from "../lib/publicApiClient";
import { validatePromoThunk, clearPromoValidation } from "../features/booking/bookingSlice";

// Helper untuk format harga
const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace(/\s/g, "");

const FoodPage = () => {
  const dispatch = useDispatch();
  const { items, categories, selectedCategory, status, bookingStatus, bookingData, bookingError } = useSelector(
    (state) => state.fnbs
  );
  const [selections, setSelections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(true);
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState({
    fullName: "",
    phoneNumber: "",
    agreed: false,
  });
  const [taxInfo, setTaxInfo] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [promoPercentage, setPromoPercentage] = useState(0);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [shouldBlock, setShouldBlock] = useState(false);
  const navigationAttemptRef = useRef(null);
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  const navigate = useNavigate();
  const { promoValidation } = useSelector((state) => state.booking);

  // Get current date for booking summary
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = format(now, "EEEE, do MMMM yyyy", { locale: enUS });
    return currentDate;
  };

  // Enable navigation blocking when in personal info form
  useEffect(() => {
    setShouldBlock(showPersonalInfo);
  }, [showPersonalInfo]);

  // Handle browser back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        setShowNavigationWarning(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add a state to prevent back navigation
    if (shouldBlock) {
      window.history.pushState(null, '', window.location.pathname);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock]);

  // Block all navigation attempts (including navbar links)
  useEffect(() => {
    if (!shouldBlock) return;

    const handleClick = (e) => {
      // Check if clicked element is a link or has a link ancestor
      const link = e.target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        // Only block internal navigation (not external links)
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          e.preventDefault();
          e.stopPropagation();

          // Store the attempted navigation path
          navigationAttemptRef.current = href;
          setShowNavigationWarning(true);
        }
      }
    };

    // Add click listener to document to catch all link clicks
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [shouldBlock]);



  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFnbsThunk());
      dispatch(fetchFnbsCategoriesThunk());
    }
  }, [dispatch, status]);

  // Fetch tax information
  useEffect(() => {
    const fetchTaxInfo = async () => {
      try {
        const taxRes = await publicApiClient.get("/api/public/taxes");
        const activeTax = Array.isArray(taxRes.data)
          ? taxRes.data.find((t) => t.is_active)
          : null;
        setTaxInfo(activeTax || null);
      } catch (err) {
        console.error("Failed to load tax information", err);
      }
    };
    fetchTaxInfo();
  }, []);

  // Handle promo validation response (match behavior from BookingPaymentPage)
  useEffect(() => {
    if (promoValidation.status === "succeeded" && promoValidation.promoData) {
      const promo = promoValidation.promoData;
      if (promo.is_active) {
        const baseSubtotal = selections.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = (baseSubtotal * Number(promo.percentage)) / 100;
        setVoucherDiscount(discount);
        setVoucherCode(`PROMO ${promo.promo_code}`);
        // promo.id intentionally unused in FoodPage
        setPromoPercentage(Number(promo.percentage));
        toast.success(`Voucher "${promo.promo_code}" applied! ${promo.percentage}% discount`);
      } else {
        toast.error("Oops! Promo ini sudah tidak berlaku! Nantikan promo menarik dari kami.");
      }
    } else if (promoValidation.status === "failed") {
      toast.error(promoValidation.error || "Kode promo tidak lagi tersedia");
    }
  }, [promoValidation, selections]);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    if (selections.length === 0) {
      toast.error("Please select at least one item before applying promo");
      return;
    }
    dispatch(clearPromoValidation());
    dispatch(validatePromoThunk(promoCode.trim().toUpperCase()));
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setVoucherDiscount(0);
    setVoucherCode("");
    setPromoPercentage(0);
    dispatch(clearPromoValidation());
    toast.success("Promo code removed successfully");
  };

  // Memfilter item F&B berdasarkan kategori yang dipilih dan search query
  const filteredItems = items.filter((item) => {
    // Filter berdasarkan kategori
    const categoryMatch = selectedCategory === "all" || !selectedCategory || item.fnb_category?.category === selectedCategory;

    // Filter berdasarkan search query
    const searchMatch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fnb_category?.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Handler untuk mengubah kuantitas item
  const handleQuantityChange = (item, delta) => {
    const currentQuantity = selections.find((s) => s.id === item.id)?.quantity || 0;
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      setSelections(selections.filter((s) => s.id !== item.id));
    } else {
      const updatedSelections = selections.filter((s) => s.id !== item.id);
      setSelections([
        ...updatedSelections,
        {
          ...item,
          quantity: newQuantity,
        },
      ]);
    }
  };

  // Handler untuk form personal info
  const handlePersonalInfoChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setPersonalInfoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handler untuk use login info change
  const handleUseLoginInfoChange = useCallback((checked) => {
    setUseLoginInfo(checked);
  }, []);

  // Handler untuk order button
  const handleOrderClick = () => {
    if (selections.length > 0) {
      setShowPersonalInfo(true);
    }
  };

  // Handler untuk back to F&B selection
  const handleBackToSelection = () => {
    setShowBackConfirmation(true);
  };

  // Handler untuk konfirmasi back
  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    setShowPersonalInfo(false);

    // Reset personal info
    setPersonalInfoData({
      fullName: "",
      phoneNumber: "",
      agreed: false,
    });
    setUseLoginInfo(false);

    // Reset promo code and validation
    setPromoCode("");
    setVoucherDiscount(0);
    setVoucherCode("");
    setPromoPercentage(0);
    dispatch(clearPromoValidation());

    // Reset booking status when going back
    if (bookingStatus !== "idle") {
      dispatch(resetBookingStatus());
    }
  };

  // Handler untuk cancel back
  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  // Handler untuk navigation warning modal (other navigation attempts)
  const handleContinuePayment = () => {
    setShowNavigationWarning(false);
    navigationAttemptRef.current = null;
  };

  const handleConfirmExit = () => {
    setShowNavigationWarning(false);
    setShouldBlock(false); // Disable blocking for this navigation

    // Reset personal information and promo code
    setPersonalInfoData({
      fullName: "",
      phoneNumber: "",
      agreed: false,
    });
    setUseLoginInfo(false);
    setPromoCode("");
    setVoucherDiscount(0);
    setVoucherCode("");
    setPromoPercentage(0);
    dispatch(clearPromoValidation());

    // If there was a navigation attempt, proceed with it
    if (navigationAttemptRef.current) {
      const targetPath = navigationAttemptRef.current;
      navigationAttemptRef.current = null;
      // Small delay to ensure shouldBlock state is updated
      setTimeout(() => {
        navigate(targetPath);
      }, 10);
    } else {
      // Fallback to home page
      navigate("/");
    }
  };

  // Handler untuk toggle booking summary
  const handleToggleBookingSummary = () => {
    setShowBookingSummary(prev => !prev);
  };

  // Handler untuk submit order
  const handleSubmitOrder = () => {
    // Validate form
    if (!personalInfoData.fullName || !personalInfoData.phoneNumber || !personalInfoData.agreed) {
      toast.error("Please fill in all required fields and agree to terms & conditions");
      return;
    }

    // Validate selections
    if (selections.length === 0) {
      toast.error("Please select at least one food or drink item");
      return;
    }

    // Prepare F&B data for API with personal information
    const fnbData = {
      fnbs: selections.map(item => ({
        id: item.id,
        quantity: item.quantity
      })),
      // Add personal information for guest booking
      name: personalInfoData.fullName.trim(),
      phone: personalInfoData.phoneNumber.trim()
    };

    console.log("Submitting F&B order:", fnbData); // Debug log
    console.log("Expected API format:", {
      fnbs: "array of {id: number, quantity: number}",
      name: "string (required)",
      phone: "string (required)"
    });

    // Dispatch booking action
    dispatch(bookFnbsThunk(fnbData));
  };

  // Handle booking status changes
  useEffect(() => {
    if (bookingStatus === "succeeded" && bookingData?.data) {
      console.log("F&B Booking successful:", bookingData);

      // Check if snapUrl is available for direct redirect
      if (bookingData.snapUrl) {
        console.log("Redirecting to Midtrans:", bookingData.snapUrl);

        // Show redirect message first
        toast.success("Order submitted successfully! Redirecting to payment...");

        // Redirect to Midtrans snap URL after a short delay
        setTimeout(() => {
          window.location.href = bookingData.snapUrl;
        }, 1500);
      } else {
        // Fallback to success page with order details
        console.warn("No snapUrl available, using fallback success page");
        const { invoice_number, total_price } = bookingData.data;
        navigate(`/food-drinks/success?invoice_number=${invoice_number}&total_price=${total_price}`);
      }

      // Reset booking status
      dispatch(resetBookingStatus());
    } else if (bookingStatus === "failed" && bookingError) {
      console.error("F&B Booking failed:", bookingError);

      // Handle validation errors
      if (bookingError.errors) {
        // Show specific validation errors
        Object.entries(bookingError.errors).forEach(([field, messages]) => {
          const fieldName = field === 'fnbs' ? 'Food & Drinks' : field;
          toast.error(`${fieldName}: ${messages[0]}`);
        });
      } else {
        // Show general error message
        toast.error(bookingError?.message || "Failed to submit order. Please try again.");
      }
    }
  }, [bookingStatus, bookingData, bookingError, navigate, dispatch]);

  // Reset booking status when component unmounts or when going back to selection
  useEffect(() => {
    return () => {
      if (bookingStatus !== "idle") {
        dispatch(resetBookingStatus());
      }
    };
  }, [bookingStatus, dispatch]);

  return (
    <div className="container mx-auto px-4 py-16 lg:py-24">
      {/* Header Section */}
      <div className="text-center w-full max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl lg:text-6xl font-minecraft mb-4">
          <span className="text-theme-primary">Food & </span>
          <span className="text-brand-gold">Drinks</span>
        </h1>
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-3 w-3 bg-brand-gold"></div>
          <div className="h-3 w-3 bg-black"></div>
          <div className="h-3 w-3 bg-brand-gold"></div>
        </div>
        <p className="text-white text-lg max-w-2xl mx-auto mb-8">
          Pilih makanan dan minuman favoritmu untuk menemani sesi gaming yang seru!
        </p>

        {/* Booking Summary - Only show when not in personal info form */}
        {!showPersonalInfo && (
          showBookingSummary ? (
            <div className="w-full max-w-3xl mx-auto mb-8">
              {/* Single Header with Toggle */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="font-minecraft text-2xl text-brand-gold">
                    Booking Summary
                  </h2>
                  <button
                    className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100 transition-colors"
                    onClick={handleToggleBookingSummary}
                    aria-label="Hide booking summary"
                  >
                    <IoIosArrowUp size={24} className="text-brand-gold" />
                  </button>
                </div>

                {/* Full Booking Summary Content */}
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-black mb-2">
                    <span className="text-left">Type</span>
                    <span className="text-left">Description</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="border-t border-gray-200 pb-2"></div>
                  <div className="mt-4 space-y-4">
                    {(() => {
                      const summaryItems = [
                        {
                          label: "Date & Time",
                          value: getCurrentDateTime(),
                          quantity: "-",
                        },
                        {
                          label: "Food & Drinks",
                          value: selections.length > 0
                            ? selections.map(item => `${item.name} (x${item.quantity})`).join(', ')
                            : null,
                          quantity: selections.length > 0
                            ? selections.reduce((acc, item) => acc + item.quantity, 0)
                            : "-",
                          total: selections.length > 0
                            ? formatPrice(selections.reduce((sum, item) => sum + (item.price * item.quantity), 0))
                            : "-",
                        },
                      ];

                      return summaryItems.map((item) => (
                        <div
                          key={item.label}
                          className="grid grid-cols-4 gap-4 items-center text-sm"
                        >
                          <span className="font-bold text-black text-left">{item.label}</span>
                          <span className="text-black break-words text-left">
                            {item.value || "-"}
                          </span>
                          <span className="text-black text-center">{item.quantity}</span>
                          <span className="font-semibold text-black text-right">
                            {item.total || "-"}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <span className="font-bold text-lg text-black">Subtotal</span>
                    <span className="font-bold text-lg text-brand-gold">
                      {formatPrice(selections.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto mb-8">
              {/* Collapsed Header Only */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex justify-between items-center p-4">
                  <h2 className="font-minecraft text-2xl text-brand-gold">
                    Booking Summary
                  </h2>
                  <button
                    className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100 transition-colors"
                    onClick={handleToggleBookingSummary}
                    aria-label="Show booking summary"
                  >
                    <IoIosArrowDown size={24} className="text-brand-gold" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Show Personal Info Form or F&B Selection */}
        {showPersonalInfo ? (
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6 text-left">
              <button
                onClick={handleBackToSelection}
                className="btn btn-ghost btn-sm gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Food Selection
              </button>
            </div>

            {/* Personal Info and Booking Summary Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info Form */}
              <div>
                <PersonalInfoForm
                  formData={personalInfoData}
                  onFormChange={handlePersonalInfoChange}
                  useLoginInfo={useLoginInfo}
                  onUseLoginInfoChange={handleUseLoginInfoChange}
                />
              </div>

              {/* F&B Booking Summary */}
              <div className="bg-white border border-brand-gold/30 rounded-lg shadow-lg h-fit">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="font-minecraft text-2xl text-brand-gold">Booking Summary</h3>
                  <button className="btn btn-sm btn-ghost btn-circle">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Summary Table */}
                <div className="p-6">
                  {/* Table Headers */}
                  <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-200 font-bold text-sm text-black">
                    <div className="text-left">Description</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Total</div>
                  </div>

                  {/* F&B Items */}
                  {selections.length > 0 ? (
                    <>
                      {selections.map((item) => (
                        <div key={item.id} className="grid grid-cols-3 gap-4 py-3 text-sm text-black border-b border-gray-100 last:border-b-0">
                          <div className="truncate text-left" title={item.name}>{item.name}</div>
                          <div className="text-center">{item.quantity}</div>
                          <div className="text-right font-medium">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 py-3 text-sm text-black">
                      <div className="text-left">-</div>
                      <div className="text-center">-</div>
                      <div className="text-right">-</div>
                    </div>
                  )}

                  {/* Separator */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Totals */}
                  <div className="space-y-2">
                    {/* Tax */}
                    {taxInfo?.is_active && (
                      <div className="flex justify-between items-center text-sm text-black">
                        <span>PB1 {taxInfo.percentage}%</span>
                        <span className="font-medium">{formatPrice(selections.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (taxInfo.percentage / 100))}</span>
                      </div>
                    )}

                    {/* Voucher Discount */}
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{voucherCode} ({promoPercentage}%)</span>
                          <button
                            onClick={handleRemovePromo}
                            className="btn btn-xs btn-ghost text-red-600 hover:bg-red-100 hover:text-red-700 p-1"
                            title="Remove promo code"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="font-semibold">-{formatPrice(voucherDiscount)}</span>
                      </div>
                    )}

                    {/* Subtotal */}
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-200 text-black">
                      <span>Subtotal</span>
                      <span className="text-brand-gold">
                        {(() => {
                          const base = selections.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const tax = taxInfo?.is_active ? base * (taxInfo.percentage / 100) : 0;
                          const total = base + tax - voucherDiscount;
                          return formatPrice(Math.max(total, 0));
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-black mb-3 text-left">Got any promo code?</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ex: OPENINGYUK"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 input input-bordered input-sm bg-white text-black placeholder:text-gray-500"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoValidation.status === "loading" || !promoCode.trim()}
                        className="btn btn-sm bg-brand-gold hover:bg-brand-gold/80 text-white disabled:opacity-50"
                      >
                        {promoValidation.status === "loading" ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Order Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmitOrder}
                disabled={bookingStatus === "loading"}
                className="btn bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft text-lg w-full"
              >
                {bookingStatus === "loading" ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing Order...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>

              {/* Redirect Message */}
              {bookingStatus === "succeeded" && bookingData?.snapUrl && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    🚀 Redirecting to payment gateway...
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Please wait while we redirect you to complete your payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Controls moved below to align with card grid */}
          </>
        )}
      </div>

      {/* Show F&B Items only when not showing personal info */}
      {!showPersonalInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content - F&B Selection */}
          <div className="lg:col-span-2">
            {/* Search + Category Controls (aligned with cards) */}
            <div className="w-full mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search (left) */}
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search food & drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search food and drinks"
                    className="input input-bordered w-full pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all duration-300"
                  />
                  <FaSearch className="absolute inset-y-3 left-3 flex items-center pointer-events-none text-gray-400 w-4 h-4" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Categories (right) */}
                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                  <button
                    onClick={() => {
                      dispatch(setSelectedCategory("all"));
                      setSearchQuery("");
                    }}
                    className={`btn btn-sm capitalize transition-all duration-300 ${selectedCategory === "all"
                      ? "bg-brand-gold text-white shadow-lg"
                      : "btn-ghost hover:bg-brand-gold/10"
                      }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        dispatch(setSelectedCategory(cat.category));
                        setSearchQuery("");
                      }}
                      className={`btn btn-sm capitalize transition-all duration-300 ${selectedCategory === cat.category
                        ? "bg-brand-gold text-white shadow-lg"
                        : "btn-ghost hover:bg-brand-gold/10"
                        }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {status === "loading" && (
              <div className="text-center p-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {/* F&B Items Grid */}
            {status === "succeeded" && (
              <>
                {/* Search Results Info */}
                {(searchQuery || selectedCategory !== "all") && (
                  <div className="text-center mb-6">
                    <p className="text-sm text-theme-secondary">
                      {filteredItems.length > 0
                        ? `Found ${filteredItems.length} item${filteredItems.length > 1 ? 's' : ''}`
                        : 'No items found'
                      }
                      {searchQuery && (
                        <span className="text-brand-gold font-semibold">
                          {' '}for "{searchQuery}"
                        </span>
                      )}
                      {selectedCategory !== "all" && (
                        <span className="text-brand-gold font-semibold">
                          {' '}in {selectedCategory}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                      const selectedItem = selections.find((s) => s.id === item.id);
                      const quantity = selectedItem?.quantity || 0;

                      return (
                        <div
                          key={item.id}
                          className={`card bg-base-100 shadow-lg transition-all duration-300 ${quantity > 0
                            ? "border-2 border-brand-gold"
                            : "border-2 border-transparent"
                            }`}
                        >
                          <figure className="h-32 bg-gray-100">
                            <img
                              src={
                                item.image
                                  ? `${imageBaseUrl}/${item.image}`
                                  : "/images/fnb-placeholder.png"
                              }
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </figure>
                          <div className="card-body p-4">
                            <h2 className="card-title text-sm font-minecraft">{item.name}</h2>
                            <p className="text-xs font-bold text-brand-gold">
                              {formatPrice(item.price)}
                            </p>
                            <div className="card-actions justify-end items-center mt-2">
                              <button
                                onClick={() => handleQuantityChange(item, -1)}
                                className="btn btn-xs btn-ghost btn-circle"
                                disabled={quantity === 0}
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-sm w-6 text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, 1)}
                                className="btn btn-xs btn-ghost btn-circle"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-base-200 rounded-lg p-8 max-w-md mx-auto">
                      <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-theme-primary mb-2">
                        No items found
                      </h3>
                      <p className="text-theme-secondary mb-4">
                        {searchQuery
                          ? `No food & drinks found for "${searchQuery}"`
                          : `No items available in ${selectedCategory} category`
                        }
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          dispatch(setSelectedCategory("all"));
                        }}
                        className="btn btn-sm bg-brand-gold text-white hover:bg-brand-gold/80"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Order Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleOrderClick}
                className="btn w-full bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft text-lg"
                disabled={selections.length === 0}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Warning Modal - Back to Selection Button (match BookingPaymentPage) */}
      {showBackConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            {/* Gambar Kustom di Atas - Sama dengan ConfirmationModal */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/tanya.png"
                alt="warning icon"
                className="h-16 w-auto"
              />
            </div>

            {/* Judul & Children (Isi Pesan) */}
            <h3 className="text-lg font-bold mb-2 text-gray-800">Change of plans?</h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="leading-relaxed">You'll be redirected to the food & drinks page to adjust your order</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <button
                onClick={handleCancelBack}
                className="btn bg-brand-gold text-white w-full"
              >
                Continue Payment
              </button>
              <button
                onClick={handleConfirmBack}
                className="btn btn-ghost w-full"
              >
                Adjust Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Warning Modal - Other Navigation Attempts (match BookingPaymentPage) */}
      {showNavigationWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            {/* Gambar Kustom di Atas */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/cancel.png"
                alt="warning icon"
                className="h-16 w-auto"
              />
            </div>

            {/* Judul & Children (Isi Pesan) */}
            <h3 className="text-lg font-bold mb-2 text-gray-800">Are you sure you want to exit?</h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="leading-relaxed">Your order data will not be saved and you'll need to start over</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <button
                onClick={handleContinuePayment}
                className="btn bg-brand-gold text-white w-full"
              >
                Continue Payment
              </button>
              <button
                onClick={handleConfirmExit}
                className="btn btn-outline border-red-500 text-red-600 hover:bg-red-50 w-full"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodPage;
