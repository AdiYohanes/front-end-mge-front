// src/pages/ProfileRewardsPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import publicApiClient from "../lib/publicApiClient";
import { redeemReward, applyReward, getUserRewards } from "../features/rewards/rewardsApi";

// Available rewards and user rewards will be fetched from API

const categoryList = ["All", "Food & Drinks", "Room"];

const ProfileRewardsPage = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const userPoints = user?.total_points || 0;

    // Helper function to handle image URLs
    const getImageUrl = (imagePath, fallbackImage = "/images/coin.png") => {
        if (!imagePath) return fallbackImage;
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        if (imagePath.startsWith('/')) {
            return imagePath;
        }
        // For relative paths from API, use VITE_IMAGE_BASE_URL from environment
        const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
        if (imageBaseUrl) {
            return `${imageBaseUrl}/${imagePath}`;
        }
        // Fallback to publicApiClient base URL if env var not available
        const backendBaseUrl = publicApiClient.defaults.baseURL;
        return `${backendBaseUrl}/${imagePath}`;
    };
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeCategory, setActiveCategory] = React.useState("All");
    const [availableRewards, setAvailableRewards] = React.useState([]);
    const [userRewards, setUserRewards] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [userRewardsLoading, setUserRewardsLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [userRewardsError, setUserRewardsError] = React.useState("");
    const [redeemingId, setRedeemingId] = React.useState(null);
    const [redeemError, setRedeemError] = React.useState("");
    const [redeemSuccess, setRedeemSuccess] = React.useState("");
    const [applyingId, setApplyingId] = React.useState(null);
    const [applyError, setApplyError] = React.useState("");
    const [applySuccess, setApplySuccess] = React.useState("");
    const [showRedeemModal, setShowRedeemModal] = React.useState(false);
    const [selectedReward, setSelectedReward] = React.useState(null);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSelectCategory = (cat) => setActiveCategory(cat);

    const handleRedeemClick = (reward) => {
        if (!user?.id) {
            setRedeemError("Please login to redeem rewards");
            return;
        }

        if (userPoints < reward.points) {
            setRedeemError("Not enough points to redeem this reward");
            return;
        }

        setSelectedReward(reward);
        setShowRedeemModal(true);
    };

    const handleRedeemConfirm = async () => {
        if (!selectedReward) return;

        const rewardId = selectedReward.id;
        setRedeemingId(rewardId);
        setRedeemError("");
        setRedeemSuccess("");
        setShowRedeemModal(false);

        try {
            const apiResponse = await redeemReward(rewardId);
            console.log("Redeem Reward API Response:", apiResponse);

            // Store API response for Use Now button
            setSelectedReward(prev => ({ ...prev, apiResponse }));

            // Remove redeemed reward from available list
            setAvailableRewards(prev => prev.filter(reward => reward.id !== rewardId));

            // Show success modal immediately after redeem
            setShowSuccessModal(true);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to redeem reward";
            setRedeemError(message);

            // Clear error message after 5 seconds
            setTimeout(() => setRedeemError(""), 5000);
        } finally {
            setRedeemingId(null);
            // Don't reset selectedReward here - keep it for success modal
        }
    };

    const handleRedeemCancel = () => {
        setShowRedeemModal(false);
        setSelectedReward(null);
    };

    const handleApplyReward = async (rewardId) => {
        if (!user?.id) {
            setApplyError("Please login to apply rewards");
            return;
        }

        setApplyingId(rewardId);
        setApplyError("");
        setApplySuccess("");

        try {
            const applyResponse = await applyReward(rewardId);
            console.log("Your Rewards - Apply Reward API Response:", applyResponse);

            // Get redirect URL from API response
            const redirectTo = applyResponse?.redirect_to;
            console.log("Your Rewards - Redirect to:", redirectTo);

            if (redirectTo) {
                console.log("Your Rewards - Redirecting to", redirectTo, "with reward data");
                // Redirect to the URL specified in API response with reward data
                navigate(redirectTo, {
                    state: {
                        rewardData: applyResponse,
                        fromReward: true
                    }
                });
                return; // Exit early, don't show success message
            } else {
                // No redirect URL specified, show success message
                console.warn("Your Rewards - No redirect URL in response");
                setApplySuccess("Reward applied successfully!");
            }

            // Update the reward as used in the state
            setUserRewards(prev => prev.map(reward =>
                reward.id === rewardId ? { ...reward, used: true } : reward
            ));

            // Clear success message after 3 seconds
            setTimeout(() => setApplySuccess(""), 3000);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to apply reward";
            setApplyError(message);

            // Clear error message after 5 seconds
            setTimeout(() => setApplyError(""), 5000);
        } finally {
            setApplyingId(null);
        }
    };

    const RedeemConfirmModal = () => {
        if (!showRedeemModal || !selectedReward) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-theme-primary rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    {/* Header Icon */}
                    <div className="flex justify-center mb-4">
                        <img
                            src="/images/tanya.png"
                            alt="Question mark icon"
                            className="w-16 h-16 object-contain"
                        />
                    </div>

                    {/* Main Text */}
                    <div className="text-center mb-6">
                        <p className="text-lg text-theme-primary mb-2">
                            Are you sure you want to <strong>exchange</strong> your point?
                        </p>
                        <p className="text-sm text-theme-secondary">
                            Your point will be deducted after the confirmation.
                        </p>
                    </div>

                    {/* Point Exchange Details */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <img src="/images/coin.png" alt="points" className="h-6 w-6" />
                            <span className="text-brand-gold font-semibold">{userPoints} points</span>
                        </div>
                        <div className="text-theme-secondary text-xl">{">"}</div>
                        <div className="flex items-center gap-2">
                            <img src="/images/coin.png" alt="points" className="h-6 w-6" />
                            <span className="text-brand-gold font-semibold">{selectedReward.points} points</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRedeemConfirm}
                            disabled={redeemingId === selectedReward.id}
                            className="btn bg-brand-gold hover:bg-yellow-600 text-white w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {redeemingId === selectedReward.id ? "Redeeming..." : "Redeem Point"}
                        </button>
                        <button
                            onClick={handleRedeemCancel}
                            className="btn btn-ghost text-theme-primary w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-theme-primary rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                    {/* Header Icon */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/images/success.png"
                            alt="Success icon"
                            className="w-24 h-24 object-contain"
                        />
                    </div>

                    {/* Main Text */}
                    <div className="text-center mb-8">
                        <p className="text-xl text-theme-primary mb-3 font-medium">
                            Point has been exchanged.
                        </p>
                        <p className="text-base text-theme-secondary">
                            Thank you for using our service!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={async () => {
                                if (!selectedReward?.id) {
                                    console.error("No selectedReward.id found:", selectedReward);
                                    return;
                                }

                                // Use the user reward ID from the redeem response, not the original reward ID
                                console.log("Full selectedReward object:", selectedReward);
                                console.log("Full apiResponse object:", selectedReward.apiResponse);

                                // Try different possible structures for user reward ID
                                const userRewardId = selectedReward.apiResponse?.id ||
                                    selectedReward.apiResponse?.data?.id ||
                                    selectedReward.apiResponse?.user_reward_id ||
                                    selectedReward.apiResponse?.reward_id;

                                if (!userRewardId) {
                                    console.error("No user reward ID found in apiResponse:", selectedReward.apiResponse);
                                    console.error("Available keys in apiResponse:", Object.keys(selectedReward.apiResponse || {}));

                                    // Fallback: Try to get the latest user reward from getUserRewards
                                    console.log("Trying fallback: getting latest user reward...");
                                    try {
                                        const userRewardsResponse = await getUserRewards();
                                        const userRewardsList = Array.isArray(userRewardsResponse.data) ? userRewardsResponse.data : Array.isArray(userRewardsResponse) ? userRewardsResponse : [];

                                        if (userRewardsList.length > 0) {
                                            // Get the most recent reward (assuming it's the one just redeemed)
                                            const latestReward = userRewardsList[0];
                                            const fallbackId = latestReward.id;
                                            console.log("Found fallback user reward ID:", fallbackId);

                                            if (fallbackId) {
                                                // Use the fallback ID
                                                const applyResponse = await applyReward(fallbackId);
                                                console.log("Use Now clicked - Apply Reward API Response (fallback):", applyResponse);

                                                const redirectTo = applyResponse?.redirect_to;
                                                if (redirectTo) {
                                                    navigate(redirectTo, {
                                                        state: {
                                                            rewardData: applyResponse,
                                                            fromReward: true
                                                        }
                                                    });
                                                    setShowSuccessModal(false);
                                                    setSelectedReward(null);
                                                    return;
                                                } else {
                                                    setShowSuccessModal(false);
                                                    setSelectedReward(null);
                                                    return;
                                                }
                                            }
                                        }
                                    } catch (fallbackError) {
                                        console.error("Fallback also failed:", fallbackError);
                                    }

                                    return;
                                }

                                console.log("Attempting to apply user reward with ID:", userRewardId);
                                console.log("Selected reward data:", selectedReward);

                                try {
                                    const applyResponse = await applyReward(userRewardId);
                                    console.log("Use Now clicked - Apply Reward API Response:", applyResponse);

                                    // Get redirect URL from API response
                                    const redirectTo = applyResponse?.redirect_to;
                                    console.log("Use Now - Redirect to:", redirectTo);

                                    if (redirectTo) {
                                        console.log("Use Now - Redirecting to", redirectTo, "with reward data");
                                        // Redirect to the URL specified in API response with reward data
                                        navigate(redirectTo, {
                                            state: {
                                                rewardData: applyResponse,
                                                fromReward: true
                                            }
                                        });
                                        setShowSuccessModal(false);
                                        setSelectedReward(null); // Reset selectedReward after redirect
                                    } else {
                                        // No redirect URL specified, just close modal
                                        console.warn("Use Now - No redirect URL in response");
                                        setShowSuccessModal(false);
                                        setSelectedReward(null); // Reset selectedReward when closing modal
                                    }
                                } catch (error) {
                                    console.error("Failed to apply reward:", error);
                                    const message = error.response?.data?.message || error.message || "Failed to apply reward";
                                    console.log("Apply Reward Error:", message);
                                    setShowSuccessModal(false);
                                    setSelectedReward(null); // Reset selectedReward on error
                                }
                            }}
                            className="btn bg-brand-gold hover:bg-yellow-600 text-white w-full py-3 text-lg font-medium"
                        >
                            Use Now
                        </button>
                        <button
                            onClick={async () => {
                                setShowSuccessModal(false);
                                setSelectedReward(null); // Reset selectedReward when closing modal
                                // Refresh user rewards to show the newly redeemed reward
                                if (window.loadUserRewards) {
                                    await window.loadUserRewards();
                                }
                                // Refresh page to update user points
                                setTimeout(() => {
                                    window.location.reload();
                                }, 100);
                            }}
                            className="btn btn-ghost text-theme-primary w-full py-3 text-lg font-medium"
                        >
                            Use Later
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-col items-center gap-3 text-center">
                <h1 className="font-minecraft text-5xl lg:text-6xl text-brand-gold">Rewards</h1>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-brand-gold" aria-hidden="true"></div>
                    <div className="h-2 w-2 bg-black" aria-hidden="true"></div>
                    <div className="h-2 w-2 bg-brand-gold" aria-hidden="true"></div>
                </div>
                <div className="text-sm text-theme-secondary">
                    <span className="inline-flex items-center gap-3">
                        <img src="/images/coin.png" alt="points" className="h-8 w-8" />
                        <strong className="text-brand-gold text-2xl">{userPoints} points</strong>
                    </span>
                    <div className="mt-1">Expired on August 12, 2025</div>
                </div>
            </div>
        );
    };

    const RewardCard = ({ item, actionLabel }) => {
        const isApplying = applyingId === item.id;
        const isUsed = item.status === 'used' || item.used;

        const handleImageError = (e) => {
            e.target.src = "/images/coin.png"; // Fallback to default image
        };

        return (
            <div className="card bg-theme-primary border border-theme shadow-md">
                <figure className="h-40 overflow-hidden relative">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                    {item.daysLeft && item.daysLeft > 0 && !isUsed && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-brand-gold text-white px-3 py-1 rounded-lg flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-minecraft text-sm font-bold">{item.daysLeft} days</span>
                            </div>
                        </div>
                    )}
                    {isUsed && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-gray-500 text-white px-3 py-1 rounded-lg flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="font-minecraft text-sm font-bold">Used</span>
                            </div>
                        </div>
                    )}
                </figure>
                <div className="card-body p-4 gap-2">
                    <h3 className="card-title text-2xl text-theme-primary">{item.title}</h3>
                    <p className="text-lg text-theme-secondary leading-snug">{item.desc}</p>
                    <div className="border-t border-gray-300 my-2"></div>
                    <div className="card-actions mt-2">
                        <button
                            onClick={() => !isUsed && handleApplyReward(item.id)}
                            className={`btn btn-lg w-full text-lg font-medium ${isUsed
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-brand-gold hover:bg-yellow-600 text-white'
                                }`}
                            disabled={isUsed || isApplying}
                            aria-disabled={isUsed || isApplying}
                        >
                            {isApplying ? "Applying..." : isUsed ? "Used" : actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const AvailableRewardCard = ({ item }) => {
        const isRedeeming = redeemingId === item.id;
        const canRedeem = userPoints >= item.points;

        const handleImageError = (e) => {
            e.target.src = "/images/coin.png"; // Fallback to default image
        };

        return (
            <div className="card bg-theme-primary border border-theme shadow-md overflow-hidden">
                <figure className="h-48">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                </figure>
                <div className="card-body p-4">
                    <h3 className="text-2xl font-bold text-theme-primary mb-2">{item.title}</h3>
                    <p className="text-lg text-theme-secondary leading-relaxed mb-4">{item.desc}</p>

                    {/* Divider Line */}
                    <div className="border-t border-gray-300 mb-4"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold ${canRedeem ? "text-brand-gold" : "text-error"}`}>
                                    {item.points}
                                </span>
                                <span className="text-sm text-gray-500">Point</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRedeemClick(item)}
                            disabled={isRedeeming || !canRedeem}
                            className="btn bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2 rounded-none font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-disabled={isRedeeming || !canRedeem}
                        >
                            {isRedeeming ? "Redeeming..." : canRedeem ? "Redeem" : "Not enough points"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredAvailable = availableRewards.filter((rw) => {
        const byCat = activeCategory === "All" || rw.category === activeCategory;
        const byText = rw.title.toLowerCase().includes(searchQuery.toLowerCase());
        return byCat && byText;
    });

    React.useEffect(() => {
        const loadAvailable = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await publicApiClient.get("/api/public/rewards");
                const list = Array.isArray(res.data) ? res.data : [];
                const normalized = list.map((r) => {
                    const type = r?.effects?.type;
                    const category = type === "free_fnb" ? "Food & Drinks" : type === "free_play" ? "Room" : "All";
                    const fallbackImage = type === "free_play" ? "/images/roomsnya.jpg" : "/images/coin.png";
                    const imageUrl = getImageUrl(r.image, fallbackImage);

                    return {
                        id: r.id,
                        title: r.name,
                        desc: r.description,
                        points: r.points_required,
                        category,
                        type,
                        image: imageUrl,
                    };
                });
                setAvailableRewards(normalized);
            } catch {
                setError("Failed to load rewards");
            } finally {
                setLoading(false);
            }
        };

        const loadUserRewards = async () => {
            if (!user?.id) {
                return;
            }

            setUserRewardsLoading(true);
            setUserRewardsError("");
            setUserRewards([]); // Clear previous data

            try {
                const res = await getUserRewards();

                const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];

                if (list.length === 0) {
                    setUserRewards([]);
                    return;
                }

                const normalized = list
                    .map((r) => {
                        // Calculate days left until expiration
                        const expiresAt = new Date(r.expires_at);
                        const now = new Date();
                        const timeDiff = expiresAt.getTime() - now.getTime();
                        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        return {
                            id: r.id,
                            title: r.reward?.name || r.name || r.title,
                            desc: r.reward?.description || r.description || r.desc,
                            daysLeft: daysLeft > 0 ? daysLeft : 0,
                            used: r.status === 'used' || r.used_at !== null,
                            image: getImageUrl(r.reward?.image || r.image),
                            expires_at: r.expires_at,
                            voucher_code: r.voucher_code,
                            status: r.status,
                            status_label: r.status_label,
                        };
                    });

                setUserRewards(normalized);
            } catch (error) {
                console.error("Failed to load user rewards:", error);
                console.error("Error details:", error.response?.data);
                setUserRewardsError("Failed to load your rewards");
                setUserRewards([]); // Ensure empty state on error
            } finally {
                setUserRewardsLoading(false);
            }
        };

        // Make loadUserRewards available outside the useEffect
        window.loadUserRewards = loadUserRewards;

        loadAvailable();
        loadUserRewards();
    }, [user?.id]);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Redeem Confirmation Modal */}
            <RedeemConfirmModal />

            {/* Success Modal */}
            <SuccessModal />

            {/* Success/Error Messages */}
            {(redeemSuccess || applySuccess) && (
                <div className="alert alert-success mb-4">
                    <span>✅ {redeemSuccess || applySuccess}</span>
                </div>
            )}
            {(redeemError || applyError) && (
                <div className="alert alert-error mb-4">
                    <span>❌ {redeemError || applyError}</span>
                </div>
            )}

            {renderHeader()}

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-theme-primary">Your Reward</h2>
                    <Link to="/profile" className="link text-sm">
                        Back to Profile
                    </Link>
                </div>

                {(() => {
                    if (userRewardsLoading) {
                        return (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-56 bg-base-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        );
                    } else if (userRewardsError) {
                        return <p className="mt-4 text-error">{userRewardsError}</p>;
                    } else if (userRewards.length === 0) {
                        return (
                            <div className="mt-4 text-center py-8">
                                <p className="text-theme-secondary">You don't have any rewards yet.</p>
                                <p className="text-sm text-theme-secondary mt-1">Redeem some rewards below to get started!</p>
                            </div>
                        );
                    } else {
                        return (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userRewards.map((item) => (
                                    <RewardCard key={item.id} item={item} actionLabel="Use Now" />
                                ))}
                            </div>
                        );
                    }
                })()}
            </div>

            <div className="mt-10">
                <h2 className="font-semibold text-theme-primary">Available Rewards</h2>

                <div className="mt-4 flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Find rewards..."
                            className="input input-bordered w-full bg-theme-primary"
                            aria-label="Search rewards"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary">
                            🔍
                        </span>
                    </div>

                    <div className="tabs tabs-boxed bg-transparent p-0">
                        <div className="flex gap-2 w-full">
                            {categoryList.map((cat) => (
                                <div key={cat} className="flex-1">
                                    <button
                                        onClick={() => handleSelectCategory(cat)}
                                        className={
                                            "btn btn-lg w-full " +
                                            (activeCategory === cat
                                                ? "bg-brand-gold text-white"
                                                : "bg-theme-primary border border-theme text-theme-primary")
                                        }
                                        aria-pressed={activeCategory === cat}
                                        tabIndex={0}
                                        aria-label={`Select ${cat} category`}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handleSelectCategory(cat);
                                            }
                                        }}
                                    >
                                        {cat}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-56 bg-base-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="mt-4 text-error">{error}</p>
                ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAvailable.map((item) => (
                            <AvailableRewardCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileRewardsPage;


