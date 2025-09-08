import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFnbsThunk, fetchFnbsCategoriesThunk, setSelectedCategory, bookFnbsThunk, resetBookingStatus } from "../features/fnbs/fnbsSlice";
import { FaPlus, FaMinus, FaShoppingCart, FaSearch } from "react-icons/fa";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import PersonalInfoForm from "../components/rent/PersonalInfoForm";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import publicApiClient from "../lib/publicApiClient";
import { validatePromoThunk, clearPromoValidation } from "../features/booking/bookingSlice";
import { fetchUnits } from "../features/units/unitsApi";

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
  const location = useLocation();
  const dispatch = useDispatch();
  const { items, categories, selectedCategory, status, bookingStatus, bookingData, bookingError } = useSelector(
    (state) => state.fnbs
  );
  const { user } = useSelector((state) => state.auth);
  const [selections, setSelections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(true);
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState({
    fullName: "",
    phoneNumber: "",
    notes: "",
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
  const rewardToastShownRef = useRef(false);

  // Reward states
  const [rewardInfo, setRewardInfo] = useState(null);
  const [userRewardId, setUserRewardId] = useState(null);

  // Seating section states
  const [seatingType, setSeatingType] = useState("table"); // "table", "unit", "takeaway"
  const [tableNumber, setTableNumber] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);


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

  // Auto-fill personal info for logged-in users
  useEffect(() => {
    if (user && !personalInfoData.fullName && !personalInfoData.phoneNumber) {
      setPersonalInfoData({
        fullName: user.name || "",
        phoneNumber: user.phone || "",
        notes: "",
        agreed: false,
      });
      setUseLoginInfo(true);
    }
  }, [user, personalInfoData.fullName, personalInfoData.phoneNumber]);

  // Handle reward data from redirect
  useEffect(() => {
    console.log("FoodPage - useEffect triggered", {
      hasFromReward: !!location.state?.fromReward,
      hasRewardData: !!location.state?.rewardData,
      toastShown: rewardToastShownRef.current
    });

    if (location.state?.fromReward && location.state?.rewardData && !rewardToastShownRef.current) {
      const rewardData = location.state.rewardData;
      console.log("FoodPage - Processing reward data:", rewardData);

      // Check if reward has free_fnb effects
      const effects = rewardData?.reward_details?.effects;
      if (effects?.type === "free_fnb" && effects?.fnbs) {
        console.log("FoodPage - Processing free_fnb reward:", effects.fnbs);

        // Set user reward ID
        setUserRewardId(rewardData.user_reward_id);
        console.log("FoodPage - User Reward ID:", rewardData.user_reward_id);

        // Set reward information
        setRewardInfo({
          name: rewardData.reward_details?.name,
          description: rewardData.reward_details?.description,
          discountAmount: rewardData.price_adjustment?.discount_amount || 0,
          finalPrice: rewardData.price_adjustment?.final_fnb_price || 0,
          message: rewardData.price_adjustment?.message || "Reward applied!",
          userRewardId: rewardData.user_reward_id
        });
        console.log("FoodPage - Reward Info set:", {
          name: rewardData.reward_details?.name,
          userRewardId: rewardData.user_reward_id,
          discountAmount: rewardData.price_adjustment?.discount_amount,
          finalPrice: rewardData.price_adjustment?.final_fnb_price
        });

        // Set F&B items based on reward data
        const fnbItems = effects.fnbs.map(fnb => ({
          fnb_id: fnb.fnb_id,
          quantity: fnb.quantity
        }));

        console.log("FoodPage - F&B items to add:", fnbItems);

        // We'll process these after F&B items are loaded
        // Store the reward F&B data for later processing
        setSelections([]);

        // Store reward F&B data in a ref or state for processing after items load
        window.rewardFnbs = fnbItems;

        // Show success message only once
        toast.success(`Free F&B reward applied! You have ${fnbItems.length} free item(s).`);
        rewardToastShownRef.current = true;
      }

      // Clear the location state to prevent re-processing
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Process reward F&B items after F&B data is loaded
  useEffect(() => {
    if (window.rewardFnbs && items.length > 0 && selections.length === 0) {
      console.log("FoodPage - Processing reward F&B items after data load");

      const rewardSelections = [];

      window.rewardFnbs.forEach(rewardFnb => {
        const fnbItem = items.find(item => item.id === parseInt(rewardFnb.fnb_id));
        if (fnbItem) {
          // Apply final price from reward if available
          const finalPrice = rewardInfo?.finalPrice || 0;
          rewardSelections.push({
            ...fnbItem,
            quantity: rewardFnb.quantity,
            // Override price with final price from reward (0 for free items)
            originalPrice: fnbItem.price,
            price: finalPrice
          });
          console.log(`FoodPage - Added free item: ${fnbItem.name} x${rewardFnb.quantity} (Price: ${finalPrice})`);
        } else {
          console.warn(`FoodPage - F&B item with ID ${rewardFnb.fnb_id} not found`);
        }
      });

      if (rewardSelections.length > 0) {
        setSelections(rewardSelections);
        console.log("FoodPage - Reward selections set:", rewardSelections);
      }

      // Clear the reward data
      delete window.rewardFnbs;
    }
  }, [items, selections.length, rewardInfo]);

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

  // Fetch available units when seating type is "unit"
  useEffect(() => {
    const loadUnits = async () => {
      if (seatingType === "unit") {
        setUnitsLoading(true);
        try {
          const units = await fetchUnits({ console_name: "", room_name: "" });
          setAvailableUnits(Array.isArray(units) ? units : []);
        } catch (error) {
          console.error("Failed to load units:", error);
          setAvailableUnits([]);
        } finally {
          setUnitsLoading(false);
        }
      }
    };
    loadUnits();
  }, [seatingType]);

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

  // Handler untuk seating type change
  const handleSeatingTypeChange = (type) => {
    setSeatingType(type);
    // Reset related fields when changing type
    setTableNumber("");
    setSelectedUnit("");
  };


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
      notes: "",
      agreed: false,
    });
    setUseLoginInfo(false);

    // Reset seating info
    setSeatingType("table");
    setTableNumber("");
    setSelectedUnit("");


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
      notes: "",
      agreed: false,
    });
    setUseLoginInfo(false);
    setSeatingType("table");
    setTableNumber("");
    setSelectedUnit("");
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
    // Validate form - personal info is always required
    if (!personalInfoData.fullName || !personalInfoData.phoneNumber || !personalInfoData.agreed) {
      toast.error("Please fill in all required fields and agree to terms & conditions");
      return;
    }

    // Validate selections
    if (selections.length === 0) {
      toast.error("Please select at least one food or drink item");
      return;
    }

    // Validate seating information
    if (seatingType === "table" && !tableNumber.trim()) {
      toast.error("Please enter table number");
      return;
    }
    if (seatingType === "unit" && !selectedUnit) {
      toast.error("Please select a unit");
      return;
    }

    // Prepare F&B data for API with personal information and seating
    const fnbData = {
      // Add user_reward_id at the top level if available
      ...(userRewardId && { user_reward_id: userRewardId }),
      // Add personal information - for guest users or when explicitly needed
      ...(!user && {
        name: personalInfoData.fullName.trim(),
        phone: personalInfoData.phoneNumber.trim(),
      }),
      // Add seating information
      ...(seatingType === "unit" && { unit_id: selectedUnit }),
      ...(seatingType === "table" && { table_number: tableNumber }),
      // Add notes with seating information and user notes
      notes: (() => {
        const baseNote = userRewardId ? "FnB Booking with rewards" : "FnB Booking";
        let seatingNote = "";

        if (seatingType === "table") {
          seatingNote = `Seating: Table ${tableNumber}`;
        } else if (seatingType === "unit") {
          const unitName = availableUnits.find(unit => unit.id === parseInt(selectedUnit))?.name || selectedUnit;
          seatingNote = `Seating: Unit ${unitName}`;
        } else if (seatingType === "takeaway") {
          seatingNote = "Seating: Take Away";
        }

        const userNotes = personalInfoData.notes?.trim();

        let finalNotes = baseNote;
        if (seatingNote) {
          finalNotes += ` - ${seatingNote}`;
        }
        if (userNotes) {
          finalNotes += ` - Notes: ${userNotes}`;
        }

        return finalNotes;
      })(),
      // Add F&B items
      fnbs: selections.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    };

    // Log data being sent to API
    console.log("FoodPage - F&B Data to API:", fnbData);
    if (userRewardId) {
      console.log("FoodPage - User Reward ID in API data:", userRewardId);
    }

    // Dispatch booking action
    dispatch(bookFnbsThunk(fnbData));
  };

  // Handle booking status changes
  useEffect(() => {
    if (bookingStatus === "succeeded" && bookingData?.data) {

      // If there's a reward, don't redirect to Midtrans
      if (userRewardId) {
        console.log("FoodPage - Reward booking completed, skipping Midtrans");
        toast.success("Order submitted successfully! Your reward has been applied.");

        // Redirect to success page with order details
        const { invoice_number } = bookingData.data;
        const seatingInfo = seatingType === "table" ? `Table ${tableNumber}` :
          seatingType === "unit" ? `Unit ${availableUnits.find(unit => unit.id === parseInt(selectedUnit))?.name || selectedUnit}` :
            "Take Away";
        // For reward booking, total price should be 0
        navigate(`/food-drinks/success?invoice_number=${invoice_number}&total_price=0&is_reward=true&seating=${encodeURIComponent(seatingInfo)}`);
      } else {
        // Check if snapUrl is available for direct redirect (normal booking)
        if (bookingData.snapUrl) {
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
          const seatingInfo = seatingType === "table" ? `Table ${tableNumber}` :
            seatingType === "unit" ? `Unit ${availableUnits.find(unit => unit.id === parseInt(selectedUnit))?.name || selectedUnit}` :
              "Take Away";
          navigate(`/food-drinks/success?invoice_number=${invoice_number}&total_price=${total_price}&is_reward=false&seating=${encodeURIComponent(seatingInfo)}`);
        }
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
  }, [bookingStatus, bookingData, bookingError, navigate, dispatch, userRewardId, availableUnits, seatingType, selectedUnit, tableNumber, personalInfoData.notes]);

  // Reset booking status when component unmounts or when going back to selection
  useEffect(() => {
    return () => {
      if (bookingStatus !== "idle") {
        dispatch(resetBookingStatus());
      }
    };
  }, [bookingStatus, dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 lg:py-6 flex-1 flex flex-col">
        {/* Header Section - Compact for mobile */}
        <div className="text-center w-full max-w-6xl mx-auto mb-4 lg:mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-minecraft mb-2 lg:mb-4">
            <span className="text-theme-primary">Food & </span>
            <span className="text-brand-gold">Drinks</span>
          </h1>
          <div className="flex items-center gap-2 lg:gap-3 justify-center mb-4 lg:mb-6">
            <div className="h-2 w-2 lg:h-3 lg:w-3 bg-brand-gold"></div>
            <div className="h-2 w-2 lg:h-3 lg:w-3 bg-black"></div>
            <div className="h-2 w-2 lg:h-3 lg:w-3 bg-brand-gold"></div>
          </div>
          <p className="text-white text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-4 lg:mb-6">
            Pilih makanan dan minuman favoritmu untuk menemani sesi gaming yang seru!
          </p>

          {/* Booking Summary - Only show when not in personal info form */}
          {!showPersonalInfo && (
            showBookingSummary ? (
              <div className="w-full max-w-3xl mx-auto mb-4 lg:mb-6">
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
                            total: "-",
                          },
                        ];

                        // Add individual food & drink items
                        if (selections.length > 0) {
                          selections.forEach((item, index) => {
                            summaryItems.push({
                              label: index === 0 ? "Food & Drinks" : "", // Show label only for first item
                              value: item.name,
                              quantity: item.quantity,
                              total: formatPrice(item.price * item.quantity),
                            });
                          });
                        } else {
                          summaryItems.push({
                            label: "Food & Drinks",
                            value: "No items selected",
                            quantity: "-",
                            total: "-",
                          });
                        }

                        return summaryItems.map((item, index) => (
                          <div
                            key={`${item.label}-${index}`}
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

                    {/* Reward Information */}
                    {rewardInfo && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            <div>
                              <span className="font-bold text-green-800">{rewardInfo.name}</span>
                              <p className="text-sm text-green-600">{rewardInfo.message}</p>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold">
                            -{formatPrice(rewardInfo.discountAmount)}
                          </span>
                        </div>
                      </div>
                    )}

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
              <div className="w-full max-w-3xl mx-auto mb-4 lg:mb-6">
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
            <div className="max-w-7xl mx-auto flex-1 flex flex-col">
              {/* Back Button */}
              <div className="mb-3 lg:mb-4 text-left">
                <button
                  onClick={handleBackToSelection}
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back to Food Selection</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>

              {/* Personal Info and Booking Summary - Responsive Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 flex-1">
                {/* Personal Info Form */}
                <div>
                  <PersonalInfoForm
                    formData={personalInfoData}
                    onFormChange={handlePersonalInfoChange}
                    useLoginInfo={useLoginInfo}
                    onUseLoginInfoChange={handleUseLoginInfoChange}
                  />

                  {/* Seating Section */}
                  <div className="mt-4 lg:mt-6 bg-white border border-brand-gold/30 rounded-lg shadow-lg p-4 lg:p-6">
                    <h3 className="font-minecraft text-xl text-brand-gold mb-4 text-left">Where are you sitting?</h3>

                    {/* Radio Buttons with Inline Input Fields */}
                    <div className="space-y-3">
                      {/* Table Option */}
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="seating"
                            value="table"
                            checked={seatingType === "table"}
                            onChange={() => handleSeatingTypeChange("table")}
                            className="radio radio-xs"
                          />
                          <span className="text-black font-medium">Table</span>
                        </label>
                        {seatingType === "table" && (
                          <div className="ml-6 mt-2 animate-in slide-in-from-top-2 duration-300 ease-in-out">
                            <input
                              type="text"
                              value={tableNumber}
                              onChange={(e) => setTableNumber(e.target.value)}
                              placeholder="Enter table number"
                              className="input input-bordered w-full bg-white text-black placeholder:text-gray-500 transition-all duration-200 ease-in-out focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Unit Option */}
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="seating"
                            value="unit"
                            checked={seatingType === "unit"}
                            onChange={() => handleSeatingTypeChange("unit")}
                            className="radio radio-xs"
                          />
                          <span className="text-black font-medium">Unit</span>
                        </label>
                        {seatingType === "unit" && (
                          <div className="ml-6 mt-2 animate-in slide-in-from-top-2 duration-300 ease-in-out">
                            {unitsLoading ? (
                              <div className="flex items-center space-x-2 animate-pulse">
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="text-gray-500">Loading units...</span>
                              </div>
                            ) : (
                              <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                className="select select-bordered w-full bg-white text-black transition-all duration-200 ease-in-out focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                                required
                              >
                                <option value="">Select a unit</option>
                                {availableUnits.map((unit) => (
                                  <option key={unit.id} value={unit.id}>
                                    {unit.name} - {unit.room?.name || 'Unknown Room'}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Take Away Option */}
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="seating"
                            value="takeaway"
                            checked={seatingType === "takeaway"}
                            onChange={() => handleSeatingTypeChange("takeaway")}
                            className="radio radio-xs"
                          />
                          <span className="text-black font-medium">Take Away</span>
                        </label>
                        {seatingType === "takeaway" && (
                          <div className="ml-6 mt-2 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-300 ease-in-out">
                            <p className="text-sm text-gray-600">
                              Your order will be prepared for takeaway. Please wait at the counter when ready.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-4 lg:mt-6 bg-white border border-brand-gold/30 rounded-lg shadow-lg p-4 lg:p-6">
                    <h3 className="font-minecraft text-xl text-brand-gold mb-4 text-left">Additional Notes</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Any special requests or additional information? (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={personalInfoData.notes || ""}
                        onChange={(e) => {
                          // Limit to 200 characters
                          if (e.target.value.length <= 200) {
                            handlePersonalInfoChange(e);
                          }
                        }}
                        rows={4}
                        maxLength={200}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-black placeholder:text-gray-500 resize-none transition-all duration-200"
                        placeholder="Example: Extra spicy, no ice, serve hot, allergies, etc..."
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          Help us serve you better with specific requests
                        </p>
                        <p className="text-xs text-gray-500">
                          {(personalInfoData.notes || "").length}/200 characters
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side - Booking Summary */}
                <div className="space-y-4 lg:space-y-6 order-first xl:order-last">
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

                        {/* Reward Discount */}
                        {rewardInfo && rewardInfo.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-green-600 text-sm">
                            <div className="flex items-center gap-2">
                              <span>🎁 {rewardInfo.name}</span>
                            </div>
                            <span className="font-semibold">-{formatPrice(rewardInfo.discountAmount)}</span>
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
                              const rewardDiscountAmount = rewardInfo?.discountAmount || 0;
                              const total = base + tax - voucherDiscount - rewardDiscountAmount;
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
              </div>

              {/* Submit Order Button */}
              <div className="mt-4 lg:mt-6 text-center flex-shrink-0">
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
          <div className="flex-1 flex flex-col">
            {/* Main Content - F&B Selection */}
            <div className="flex-1">
              {/* Search + Category Controls (aligned with cards) */}
              <div className="w-full mb-4 lg:mb-6">
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

                        const isFreeItem = item.originalPrice && item.price === 0;
                        const isRewardItem = rewardInfo && quantity > 0 && isFreeItem;

                        return (
                          <div
                            key={item.id}
                            className={`card bg-base-100 shadow-lg transition-all duration-300 ${quantity > 0
                              ? "border-2 border-brand-gold"
                              : "border-2 border-transparent"
                              }`}
                          >
                            <figure className="h-32 bg-gray-100 relative">
                              <img
                                src={
                                  item.image
                                    ? `${imageBaseUrl}/${item.image}`
                                    : "/images/fnb-placeholder.png"
                                }
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                              {isRewardItem && (
                                <div className="absolute top-2 right-2">
                                  <div className="bg-green-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
                                    <span>🎁</span>
                                    <span>FREE</span>
                                  </div>
                                </div>
                              )}
                            </figure>
                            <div className="card-body p-4">
                              <h2 className="card-title text-sm font-minecraft">{item.name}</h2>
                              <div className="flex items-center gap-2">
                                {isFreeItem ? (
                                  <>
                                    <p className="text-xs font-bold text-green-600">
                                      FREE
                                    </p>
                                    <p className="text-xs text-gray-500 line-through">
                                      {formatPrice(item.originalPrice)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-xs font-bold text-brand-gold">
                                    {formatPrice(item.price)}
                                  </p>
                                )}
                              </div>
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
              <div className="mt-4 lg:mt-6 text-center flex-shrink-0">
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-center p-8">
              {/* Success Image */}
              <div className="flex justify-center mb-6">
                <img
                  src="/images/success.png"
                  alt="success icon"
                  className="h-20 w-auto"
                />
              </div>

              {/* Judul & Children (Isi Pesan) */}
              <h3 className="text-2xl font-minecraft text-gray-900 mb-4">Change of plans?</h3>
              <div className="text-gray-600 mb-8">
                <p className="leading-relaxed">You'll be redirected to the food & drinks page to adjust your order</p>
              </div>

              {/* Tombol Aksi */}
              <div className="space-y-3">
                <button
                  onClick={handleCancelBack}
                  className="btn bg-brand-gold hover:bg-brand-gold/80 text-white w-full py-3 font-medium"
                >
                  Continue Payment
                </button>
                <button
                  onClick={handleConfirmBack}
                  className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 w-full py-3 font-medium"
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
    </div>
  );
};

export default FoodPage;
