// src/pages/ProfileRewardsPage.jsx
import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import publicApiClient from "../lib/publicApiClient";
import { redeemReward, applyReward, getUserRewards } from "../features/rewards/rewardsApi";

// Available rewards and user rewards will be fetched from API

const categoryList = ["All", "Food & Drinks", "Room"];

const ProfileRewardsPage = () => {
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
            await redeemReward(rewardId);

            // Remove redeemed reward from available list
            setAvailableRewards(prev => prev.filter(reward => reward.id !== rewardId));

            // Show success modal
            setShowSuccessModal(true);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to redeem reward";
            setRedeemError(message);

            // Clear error message after 5 seconds
            setTimeout(() => setRedeemError(""), 5000);
        } finally {
            setRedeemingId(null);
            setSelectedReward(null);
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
            await applyReward(rewardId);
            setApplySuccess("Reward applied successfully!");

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
                            onClick={() => setShowSuccessModal(false)}
                            className="btn bg-brand-gold hover:bg-yellow-600 text-white w-full py-3 text-lg font-medium"
                        >
                            Use Now
                        </button>
                        <button
                            onClick={() => setShowSuccessModal(false)}
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
                <h1 className="font-minecraft text-4xl text-theme-primary">Rewards</h1>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-10 rounded bg-brand-gold" aria-hidden="true"></div>
                    <div className="h-3 w-10 rounded bg-theme-primary" aria-hidden="true"></div>
                    <div className="h-3 w-10 rounded bg-brand-gold" aria-hidden="true"></div>
                </div>
                <div className="text-sm text-theme-secondary">
                    <span className="inline-flex items-center gap-2">
                        <img src="/images/coin.png" alt="points" className="h-5 w-5" />
                        <strong className="text-theme-primary">{userPoints} points</strong>
                    </span>
                    <div className="mt-1">Expired on August 12, 2025</div>
                </div>
            </div>
        );
    };

    const RewardCard = ({ item, actionLabel }) => {
        const isApplying = applyingId === item.id;

        const handleImageError = (e) => {
            e.target.src = "/images/coin.png"; // Fallback to default image
        };

        return (
            <div className="card bg-theme-primary border border-theme shadow-md">
                <figure className="h-40 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                </figure>
                <div className="card-body p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="card-title text-base text-theme-primary">{item.title}</h3>
                        {item.daysLeft ? (
                            <span className="badge badge-outline text-xs">{item.daysLeft} days</span>
                        ) : null}
                    </div>
                    <p className="text-xs text-theme-secondary leading-snug">{item.desc}</p>
                    {item.voucher_code && (
                        <div className="text-xs text-theme-secondary">
                            <span className="font-mono bg-base-200 px-2 py-1 rounded">
                                {item.voucher_code}
                            </span>
                        </div>
                    )}
                    <div className="card-actions mt-2">
                        <button
                            onClick={() => !item.used && handleApplyReward(item.id)}
                            className="btn btn-sm bg-brand-gold hover:bg-yellow-600 text-white w-full disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={item.used || isApplying}
                            aria-disabled={item.used || isApplying}
                        >
                            {isApplying ? "Applying..." : item.used ? "Used" : actionLabel}
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
            <div className="card bg-theme-primary border border-theme shadow-md">
                <figure className="h-40 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                </figure>
                <div className="card-body p-4 gap-3">
                    <h3 className="card-title text-base text-theme-primary">{item.title}</h3>
                    <p className="text-xs text-theme-secondary leading-snug">{item.desc}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                            <img src="/images/coin.png" alt="point" className="h-4 w-4" />
                            <span className={canRedeem ? "text-theme-primary" : "text-error"}>{item.points} Point</span>
                        </div>
                        <button
                            onClick={() => handleRedeemClick(item)}
                            disabled={isRedeeming || !canRedeem}
                            className="btn btn-sm bg-brand-gold hover:bg-yellow-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
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

                const normalized = list.map((r) => {
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
                        <div className="flex gap-2">
                            {categoryList.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleSelectCategory(cat)}
                                    className={
                                        "btn btn-sm " +
                                        (activeCategory === cat
                                            ? "bg-brand-gold text-white"
                                            : "bg-theme-primary border border-theme text-theme-primary")
                                    }
                                    aria-pressed={activeCategory === cat}
                                >
                                    {cat}
                                </button>
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


