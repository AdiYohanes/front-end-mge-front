import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFnbsThunk, fetchFnbsCategoriesThunk, setSelectedCategory, bookFnbsThunk, resetBookingStatus } from "../features/fnbs/fnbsSlice";
import { FaPlus, FaMinus, FaShoppingCart, FaSearch } from "react-icons/fa";
import PersonalInfoForm from "../components/rent/PersonalInfoForm";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";

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
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    agreed: false,
  });
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFnbsThunk());
      dispatch(fetchFnbsCategoriesThunk());
    }
  }, [dispatch, status]);

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
    setShowPersonalInfo(false);
    // Reset booking status when going back
    if (bookingStatus !== "idle") {
      dispatch(resetBookingStatus());
    }
  };

  // Handler untuk submit order
  const handleSubmitOrder = () => {
    // Validate form
    if (!personalInfoData.fullName || !personalInfoData.email || !personalInfoData.phoneNumber || !personalInfoData.agreed) {
      toast.error("Please fill in all required fields and agree to terms & conditions");
      return;
    }

    // Validate selections
    if (selections.length === 0) {
      toast.error("Please select at least one food or drink item");
      return;
    }

    // Prepare F&B data for API - only fnbs array required
    const fnbData = {
      fnbs: selections.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    };

    // Dispatch booking action
    dispatch(bookFnbsThunk(fnbData));
  };

  // Handle booking status changes
  useEffect(() => {
    if (bookingStatus === "succeeded" && bookingData?.booking_data) {
      // Redirect to success page with order details
      const { invoice_number, total_price } = bookingData.booking_data;
      navigate(`/food-drinks/success?invoice_number=${invoice_number}&total_price=${total_price}`);

      // Reset booking status
      dispatch(resetBookingStatus());
    } else if (bookingStatus === "failed" && bookingError) {
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
  }, []);

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
        <p className="text-theme-secondary text-lg max-w-2xl mx-auto mb-8">
          Pilih makanan dan minuman favoritmu untuk menemani sesi gaming yang seru!
        </p>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-lg border border-brand-gold/20 max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="font-minecraft text-2xl text-brand-gold">
              Booking Summary
            </h2>
            <button className="btn btn-sm btn-ghost btn-circle">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex justify-between items-start">
                <span className="font-bold text-black">Date & Time:</span>
                <span className="text-black">Friday, 21st February 2025 at 10.00 - 11.00</span>
              </div>

              {/* Food & Drinks */}
              <div className="flex justify-between items-start">
                <span className="font-bold text-black">Food & Drinks:</span>
                <span className="text-black">
                  {selections.length > 0
                    ? selections.map(item => `${item.name} (${item.quantity})`).join(', ')
                    : '-'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Show Personal Info Form or F&B Selection */}
        {showPersonalInfo ? (
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
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
                  <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200 font-bold text-sm text-black">
                    <div>Type</div>
                    <div>Description</div>
                    <div>Quantity</div>
                    <div>Total</div>
                  </div>

                  {/* F&B Items */}
                  {selections.length > 0 ? (
                    <>
                      {selections.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-4 gap-4 py-3 text-sm text-black">
                          <div className="font-semibold">
                            {index === 0 ? "Food & Drinks" : ""}
                          </div>
                          <div>{item.name}</div>
                          <div>{item.quantity}</div>
                          <div>{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="grid grid-cols-4 gap-4 py-3 text-sm text-black">
                      <div className="font-semibold">Food & Drinks</div>
                      <div>-</div>
                      <div>-</div>
                      <div>-</div>
                    </div>
                  )}

                  {/* Separator */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Totals */}
                  <div className="space-y-2">
                    {/* PPN */}
                    <div className="flex justify-between items-center text-sm text-black">
                      <span>PPN 10%</span>
                      <span>{formatPrice(selections.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1)}</span>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-200 text-black">
                      <span>Subtotal</span>
                      <span className="text-brand-gold">
                        {formatPrice(selections.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-black mb-3">Got any promo code?</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ex: user@gmail.com"
                        className="flex-1 input input-bordered input-sm bg-white text-black placeholder:text-gray-500"
                      />
                      <button className="btn btn-sm bg-brand-gold hover:bg-brand-gold/80 text-white">
                        Apply
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
                className="btn bg-brand-gold hover:bg-brand-gold/80 text-white font-minecraft text-lg w-full max-w-md"
              >
                {bookingStatus === "loading" ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing Order...
                  </>
                ) : (
                  "Submit Order"
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Category Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search food & drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all duration-300"
                  />
                  <FaSearch className="absolute inset-y-3 left-3 flex items-center pointer-events-none text-gray-400 w-4 h-4" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
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
          </>
        )}
      </div>

      {/* Show F&B Items only when not showing personal info */}
      {!showPersonalInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content - F&B Selection */}
          <div className="lg:col-span-2">
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
                Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodPage;
